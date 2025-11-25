"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const paystack_service_1 = require("../common/services/paystack.service");
const stripe_service_1 = require("../common/services/stripe.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, configService, paystackService, stripeService) {
        this.prisma = prisma;
        this.configService = configService;
        this.paystackService = paystackService;
        this.stripeService = stripeService;
    }
    async getUserPaymentMethods(userId) {
        return this.prisma.paymentMethod.findMany({
            where: {
                userId,
                isActive: true,
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
    async addCardPaymentMethod(userId, cardData) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, firstName: true, lastName: true },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const customer = await this.stripeService.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
            const stripePaymentMethod = await this.stripeService.createPaymentMethod(customer.id, {
                type: 'card',
                card: {
                    number: cardData.cardNumber,
                    exp_month: cardData.expiryMonth,
                    exp_year: cardData.expiryYear,
                    cvc: cardData.cvc,
                },
            });
            const paymentMethod = await this.prisma.paymentMethod.create({
                data: {
                    userId,
                    type: 'CARD',
                    cardDetails: {
                        last4: stripePaymentMethod.card?.last4,
                        brand: stripePaymentMethod.card?.brand,
                        expiryMonth: stripePaymentMethod.card?.exp_month,
                        expiryYear: stripePaymentMethod.card?.exp_year,
                        holderName: cardData.holderName,
                        fingerprint: stripePaymentMethod.card?.fingerprint,
                        country: stripePaymentMethod.card?.country,
                    },
                    stripeId: stripePaymentMethod.id,
                },
            });
            const userPaymentMethodsCount = await this.prisma.paymentMethod.count({
                where: { userId, isActive: true },
            });
            if (userPaymentMethodsCount === 1) {
                await this.setDefaultPaymentMethod(userId, paymentMethod.id);
            }
            return paymentMethod;
        }
        catch (error) {
            if (error.type === 'StripeCardError') {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async addCardPaymentMethodWithSetupIntent(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, firstName: true, lastName: true },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const customer = await this.stripeService.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
            const setupIntent = await this.stripeService.createSetupIntent(customer.id);
            return {
                setupIntentId: setupIntent.id,
                clientSecret: setupIntent.client_secret,
                customerId: customer.id,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create payment method setup');
        }
    }
    async confirmSetupIntent(userId, setupIntentId) {
        try {
            const setupIntent = await this.stripeService.retrieveSetupIntent(setupIntentId);
            if (setupIntent.status === 'succeeded' && setupIntent.payment_method) {
                const paymentMethod = await this.stripeService.retrievePaymentMethod(setupIntent.payment_method);
                const dbPaymentMethod = await this.prisma.paymentMethod.create({
                    data: {
                        userId,
                        type: 'CARD',
                        cardDetails: {
                            last4: paymentMethod.card?.last4,
                            brand: paymentMethod.card?.brand,
                            expiryMonth: paymentMethod.card?.exp_month,
                            expiryYear: paymentMethod.card?.exp_year,
                            fingerprint: paymentMethod.card?.fingerprint,
                            country: paymentMethod.card?.country,
                        },
                        stripeId: paymentMethod.id,
                    },
                });
                const userPaymentMethodsCount = await this.prisma.paymentMethod.count({
                    where: { userId, isActive: true },
                });
                if (userPaymentMethodsCount === 1) {
                    await this.setDefaultPaymentMethod(userId, dbPaymentMethod.id);
                }
                return dbPaymentMethod;
            }
            else {
                throw new common_1.BadRequestException('Setup intent not completed successfully');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to confirm payment method setup');
        }
    }
    async addBankPaymentMethod(userId, bankData) {
        try {
            const verification = await this.paystackService.verifyBankAccount(bankData.accountNumber, bankData.bankCode);
            const paymentMethod = await this.prisma.paymentMethod.create({
                data: {
                    userId,
                    type: 'BANK_TRANSFER',
                    bankDetails: {
                        accountNumber: verification.accountNumber,
                        accountName: verification.accountName,
                        bankName: bankData.bankName,
                        bankCode: bankData.bankCode,
                        isVerified: true,
                        verifiedAt: new Date().toISOString(),
                    },
                },
            });
            const userPaymentMethodsCount = await this.prisma.paymentMethod.count({
                where: { userId, isActive: true },
            });
            if (userPaymentMethodsCount === 1) {
                await this.setDefaultPaymentMethod(userId, paymentMethod.id);
            }
            return paymentMethod;
        }
        catch (error) {
            if (error.status && error.message) {
                throw error;
            }
            throw new common_1.BadRequestException('Unable to verify bank account. Please check your details and try again.');
        }
    }
    async createPaymentIntent(userId, amount, currency, paymentMethodId, transferId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, firstName: true, lastName: true },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const customer = await this.stripeService.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
            const metadata = {
                userId,
                userEmail: user.email,
            };
            if (transferId) {
                metadata.transferId = transferId;
            }
            const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency, customer.id, paymentMethodId, metadata);
            return {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
                status: paymentIntent.status,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create payment intent');
        }
    }
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId, paymentMethodId);
            return {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                clientSecret: paymentIntent.client_secret,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Payment confirmation failed');
        }
    }
    async getPaymentIntentStatus(paymentIntentId) {
        try {
            const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
            return {
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                lastPaymentError: paymentIntent.last_payment_error,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException('Payment intent not found');
        }
    }
    async refundPayment(paymentIntentId, amount, reason) {
        try {
            const refund = await this.stripeService.createRefund(paymentIntentId, amount, reason);
            return {
                refundId: refund.id,
                amount: refund.amount,
                status: refund.status,
                reason: refund.reason,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to process refund');
        }
    }
    async setDefaultPaymentMethod(userId, paymentMethodId) {
        const paymentMethod = await this.prisma.paymentMethod.findFirst({
            where: {
                id: paymentMethodId,
                userId,
                isActive: true,
            },
        });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        await this.prisma.paymentMethod.updateMany({
            where: {
                userId,
                isActive: true,
            },
            data: { isDefault: false },
        });
        return this.prisma.paymentMethod.update({
            where: { id: paymentMethodId },
            data: { isDefault: true },
        });
    }
    async removePaymentMethod(userId, paymentMethodId) {
        const paymentMethod = await this.prisma.paymentMethod.findFirst({
            where: {
                id: paymentMethodId,
                userId,
                isActive: true,
            },
        });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        const pendingTransfers = await this.prisma.transfer.count({
            where: {
                paymentMethodId,
                status: { in: ['PENDING', 'PROCESSING'] },
            },
        });
        if (pendingTransfers > 0) {
            throw new common_1.BadRequestException('Cannot remove payment method with pending transfers');
        }
        if (paymentMethod.type === 'CARD' && paymentMethod.stripeId) {
            try {
                await this.stripeService.detachPaymentMethod(paymentMethod.stripeId);
            }
            catch (error) {
                console.error('Failed to detach payment method from Stripe:', error);
            }
        }
        const updatedPaymentMethod = await this.prisma.paymentMethod.update({
            where: { id: paymentMethodId },
            data: { isActive: false },
        });
        if (paymentMethod.isDefault) {
            const nextPaymentMethod = await this.prisma.paymentMethod.findFirst({
                where: {
                    userId,
                    isActive: true,
                    id: { not: paymentMethodId },
                },
                orderBy: { createdAt: 'desc' },
            });
            if (nextPaymentMethod) {
                await this.setDefaultPaymentMethod(userId, nextPaymentMethod.id);
            }
        }
        return updatedPaymentMethod;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        paystack_service_1.PaystackService,
        stripe_service_1.StripeService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map