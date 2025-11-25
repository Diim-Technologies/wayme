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
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
const currency_service_1 = require("../common/services/currency.service");
const fee_service_1 = require("../common/services/fee.service");
const stripe_service_1 = require("../common/services/stripe.service");
let TransfersService = class TransfersService {
    constructor(prisma, currencyService, feeService, stripeService) {
        this.prisma = prisma;
        this.currencyService = currencyService;
        this.feeService = feeService;
        this.stripeService = stripeService;
    }
    async createTransfer(userId, createTransferDto) {
        const { amount, purpose, paymentMethodId, recipientBankId, recipientAccount, recipientName, recipientPhone, receiverId, notes, targetCurrency = 'NGN', } = createTransferDto;
        const paymentMethod = await this.prisma.paymentMethod.findFirst({
            where: {
                id: paymentMethodId,
                userId,
                isActive: true,
            },
        });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found or not active');
        }
        const quote = await this.calculateQuote(amount, 'NGN', targetCurrency, paymentMethod.type);
        const reference = this.generateReference();
        const transfer = await this.prisma.transfer.create({
            data: {
                senderId: userId,
                receiverId,
                amount: new library_1.Decimal(amount / 100),
                fee: quote.fee,
                exchangeRate: quote.exchangeRate,
                sourceCurrency: 'NGN',
                targetCurrency,
                purpose,
                reference,
                paymentMethodId,
                recipientBankId,
                recipientAccount,
                recipientName,
                recipientPhone,
                notes,
            },
            include: {
                sender: {
                    select: { firstName: true, lastName: true, email: true },
                },
                receiver: {
                    select: { firstName: true, lastName: true, email: true },
                },
                paymentMethod: true,
                recipientBank: true,
            },
        });
        await this.prisma.transaction.create({
            data: {
                transferId: transfer.id,
                type: 'DEBIT',
                amount: new library_1.Decimal((amount + quote.fee.toNumber() * 100) / 100),
                currency: 'NGN',
                reference: this.generateReference(),
            },
        });
        if (paymentMethod.type === 'CARD' && paymentMethod.stripeId) {
            try {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { email: true, firstName: true, lastName: true },
                });
                const customer = await this.stripeService.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
                const totalAmount = amount + (quote.fee.toNumber() * 100);
                const paymentIntent = await this.stripeService.createPaymentIntent(totalAmount / 100, 'ngn', customer.id, paymentMethod.stripeId, {
                    transferId: transfer.id,
                    reference: transfer.reference,
                    userId,
                    userEmail: user.email,
                });
                await this.prisma.transfer.update({
                    where: { id: transfer.id },
                    data: { status: 'PROCESSING' },
                });
                return {
                    ...transfer,
                    paymentIntent: {
                        id: paymentIntent.id,
                        clientSecret: paymentIntent.client_secret,
                        status: paymentIntent.status,
                    },
                };
            }
            catch (error) {
                await this.prisma.transfer.update({
                    where: { id: transfer.id },
                    data: { status: 'FAILED' },
                });
                await this.prisma.transaction.updateMany({
                    where: { transferId: transfer.id },
                    data: {
                        status: 'FAILED',
                        failureReason: 'Failed to create payment intent',
                    },
                });
                throw new common_1.BadRequestException('Failed to process payment. Please try again.');
            }
        }
        return transfer;
    }
    async createTransferWithPaymentIntent(userId, createTransferDto) {
        const transfer = await this.createTransfer(userId, createTransferDto);
        if ('paymentIntent' in transfer) {
            return transfer;
        }
        const paymentMethod = await this.prisma.paymentMethod.findFirst({
            where: { id: createTransferDto.paymentMethodId, userId },
        });
        if (paymentMethod?.type === 'CARD' && paymentMethod.stripeId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, firstName: true, lastName: true },
            });
            const customer = await this.stripeService.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
            const quote = await this.calculateQuote(createTransferDto.amount, 'NGN', createTransferDto.targetCurrency || 'NGN', paymentMethod.type);
            const totalAmount = createTransferDto.amount + (quote.fee.toNumber() * 100);
            const paymentIntent = await this.stripeService.createPaymentIntent(totalAmount / 100, 'ngn', customer.id, undefined, {
                transferId: transfer.id,
                reference: transfer.reference,
                userId,
                userEmail: user.email,
            });
            return {
                ...transfer,
                paymentIntent: {
                    id: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                    status: paymentIntent.status,
                },
            };
        }
        return transfer;
    }
    async getTransferById(id, userId) {
        const transfer = await this.prisma.transfer.findFirst({
            where: {
                id,
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            include: {
                sender: {
                    select: { firstName: true, lastName: true, email: true },
                },
                receiver: {
                    select: { firstName: true, lastName: true, email: true },
                },
                paymentMethod: true,
                recipientBank: true,
                transactions: true,
            },
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        return transfer;
    }
    async getUserTransfers(userId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = {
            OR: [{ senderId: userId }, { receiverId: userId }],
        };
        if (status) {
            where.status = status;
        }
        const [transfers, total] = await Promise.all([
            this.prisma.transfer.findMany({
                where,
                include: {
                    sender: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                    receiver: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                    recipientBank: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transfer.count({ where }),
        ]);
        return {
            transfers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }
    async getQuote(quoteDto) {
        const { amount, sourceCurrency = 'NGN', targetCurrency = 'NGN', paymentMethodType = 'BANK_TRANSFER' } = quoteDto;
        return this.calculateQuote(amount, sourceCurrency, targetCurrency, paymentMethodType);
    }
    async cancelTransfer(id, userId) {
        const transfer = await this.prisma.transfer.findFirst({
            where: {
                id,
                senderId: userId,
                status: { in: ['PENDING', 'PROCESSING'] },
            },
            include: {
                transactions: true,
            },
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found or cannot be cancelled');
        }
        const stripeTransaction = transfer.transactions.find(t => t.gatewayRef && t.gatewayRef.startsWith('pi_'));
        if (stripeTransaction?.gatewayRef) {
            try {
                await this.stripeService.cancelPaymentIntent(stripeTransaction.gatewayRef);
            }
            catch (error) {
                console.error('Failed to cancel Stripe payment intent:', error);
            }
        }
        return this.prisma.transfer.update({
            where: { id },
            data: { status: 'CANCELLED' },
            include: {
                sender: {
                    select: { firstName: true, lastName: true, email: true },
                },
                recipientBank: true,
            },
        });
    }
    async calculateQuote(amount, sourceCurrency, targetCurrency, paymentMethodType = 'BANK_TRANSFER') {
        const amountInNaira = new library_1.Decimal(amount / 100);
        try {
            const exchangeRate = await this.currencyService.getExchangeRate(sourceCurrency, targetCurrency, 'sell');
            const transferType = sourceCurrency === targetCurrency ? 'DOMESTIC' : 'INTERNATIONAL';
            const transferFee = await this.feeService.calculateTransferFee(amountInNaira, transferType, paymentMethodType, sourceCurrency);
            const conversionFee = await this.feeService.calculateCurrencyConversionFee(amountInNaira, sourceCurrency, targetCurrency);
            const totalFee = transferFee.add(conversionFee);
            const convertedAmount = amountInNaira.mul(exchangeRate);
            return {
                sourceAmount: amountInNaira,
                targetAmount: convertedAmount,
                fee: totalFee,
                transferFee,
                conversionFee,
                exchangeRate,
                sourceCurrency,
                targetCurrency,
                totalCost: amountInNaira.add(totalFee),
            };
        }
        catch (error) {
            return this.fallbackCalculateQuote(amount, sourceCurrency, targetCurrency);
        }
    }
    fallbackCalculateQuote(amount, sourceCurrency, targetCurrency) {
        const amountInNaira = amount / 100;
        let feeAmount = Math.max(50, Math.min(500, amountInNaira * 0.025));
        let exchangeRate = new library_1.Decimal(1);
        if (sourceCurrency !== targetCurrency) {
            const rates = {
                'NGN_USD': 0.0012,
                'NGN_GBP': 0.001,
                'NGN_EUR': 0.0011,
                'USD_NGN': 830,
                'GBP_NGN': 1000,
                'EUR_NGN': 910,
            };
            const rateKey = `${sourceCurrency}_${targetCurrency}`;
            exchangeRate = new library_1.Decimal(rates[rateKey] || 1);
        }
        const convertedAmount = new library_1.Decimal(amountInNaira).mul(exchangeRate);
        return {
            sourceAmount: new library_1.Decimal(amountInNaira),
            targetAmount: convertedAmount,
            fee: new library_1.Decimal(feeAmount),
            transferFee: new library_1.Decimal(feeAmount),
            conversionFee: new library_1.Decimal(0),
            exchangeRate,
            sourceCurrency,
            targetCurrency,
            totalCost: new library_1.Decimal(amountInNaira).add(feeAmount),
        };
    }
    generateReference() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `WAY${timestamp.slice(-6)}${random}`;
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currency_service_1.CurrencyService,
        fee_service_1.FeeService,
        stripe_service_1.StripeService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map