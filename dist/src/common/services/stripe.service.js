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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../entities");
const stripe_1 = require("stripe");
let StripeService = StripeService_1 = class StripeService {
    constructor(configService, userRepository) {
        this.configService = configService;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(StripeService_1.name);
        const mode = this.configService.get('STRIPE_MODE', 'test');
        let secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (mode === 'live') {
            secretKey = this.configService.get('STRIPE_SECRET_KEY_LIVE') || secretKey;
        }
        else {
            secretKey = this.configService.get('STRIPE_SECRET_KEY_TEST') || secretKey;
        }
        if (!secretKey) {
            throw new Error(`STRIPE_SECRET_KEY is required for mode: ${mode}`);
        }
        this.logger.log(`Initializing Stripe in ${mode.toUpperCase()} mode`);
        this.stripe = new stripe_1.default(secretKey, {
            apiVersion: '2023-10-16',
        });
    }
    async createCustomer(userId, email, name) {
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata: {
                    userId,
                },
            });
            this.logger.log(`Created Stripe customer: ${customer.id} for user: ${userId}`);
            return customer;
        }
        catch (error) {
            this.logger.error(`Failed to create Stripe customer for user ${userId}:`, error);
            throw new common_1.BadRequestException('Failed to create customer profile');
        }
    }
    async getOrCreateCustomer(userId, email, name) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'firstName', 'lastName'],
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const existingCustomers = await this.stripe.customers.list({
            email: user.email,
            limit: 1,
        });
        if (existingCustomers.data.length > 0) {
            return existingCustomers.data[0];
        }
        return this.createCustomer(userId, email, name);
    }
    async createPaymentMethod(customerId, paymentMethodData) {
        try {
            const paymentMethod = await this.stripe.paymentMethods.create(paymentMethodData);
            await this.stripe.paymentMethods.attach(paymentMethod.id, {
                customer: customerId,
            });
            return paymentMethod;
        }
        catch (error) {
            this.logger.error('Failed to create payment method:', error);
            throw new common_1.BadRequestException('Invalid card details');
        }
    }
    async attachPaymentMethod(paymentMethodId, customerId) {
        try {
            return await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });
        }
        catch (error) {
            this.logger.error('Failed to attach payment method:', error);
            throw new common_1.BadRequestException('Failed to attach payment method');
        }
    }
    async detachPaymentMethod(paymentMethodId) {
        try {
            return await this.stripe.paymentMethods.detach(paymentMethodId);
        }
        catch (error) {
            this.logger.error('Failed to detach payment method:', error);
            throw new common_1.BadRequestException('Failed to remove payment method');
        }
    }
    async listCustomerPaymentMethods(customerId, type = 'card') {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: type,
            });
            return paymentMethods.data;
        }
        catch (error) {
            this.logger.error(`Failed to list ${type} payment methods:`, error);
            return [];
        }
    }
    async createPaymentIntent(amount, currency, customerId, paymentMethodId, metadata) {
        try {
            const paymentIntentData = {
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                customer: customerId,
                metadata: metadata || {},
                automatic_payment_methods: {
                    enabled: true,
                },
            };
            if (paymentMethodId) {
                paymentIntentData.payment_method = paymentMethodId;
                paymentIntentData.confirmation_method = 'manual';
                paymentIntentData.confirm = true;
                paymentIntentData.return_url = this.configService.get('FRONTEND_URL') + '/payments/return';
            }
            const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentData);
            this.logger.log(`Created payment intent: ${paymentIntent.id} for amount: ${amount} ${currency}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error('Failed to create payment intent:', error);
            throw new common_1.BadRequestException('Failed to create payment intent');
        }
    }
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const confirmData = {
                return_url: this.configService.get('FRONTEND_URL') + '/payments/return',
            };
            if (paymentMethodId) {
                confirmData.payment_method = paymentMethodId;
            }
            return await this.stripe.paymentIntents.confirm(paymentIntentId, confirmData);
        }
        catch (error) {
            this.logger.error('Failed to confirm payment intent:', error);
            throw new common_1.BadRequestException('Payment confirmation failed');
        }
    }
    async retrievePaymentIntent(paymentIntentId) {
        try {
            return await this.stripe.paymentIntents.retrieve(paymentIntentId);
        }
        catch (error) {
            this.logger.error('Failed to retrieve payment intent:', error);
            throw new common_1.BadRequestException('Payment intent not found');
        }
    }
    async cancelPaymentIntent(paymentIntentId) {
        try {
            return await this.stripe.paymentIntents.cancel(paymentIntentId);
        }
        catch (error) {
            this.logger.error('Failed to cancel payment intent:', error);
            throw new common_1.BadRequestException('Failed to cancel payment');
        }
    }
    async createRefund(paymentIntentId, amount, reason) {
        try {
            const refundData = {
                payment_intent: paymentIntentId,
                reason,
            };
            if (amount) {
                refundData.amount = Math.round(amount * 100);
            }
            const refund = await this.stripe.refunds.create(refundData);
            this.logger.log(`Created refund: ${refund.id} for payment intent: ${paymentIntentId}`);
            return refund;
        }
        catch (error) {
            this.logger.error('Failed to create refund:', error);
            throw new common_1.BadRequestException('Failed to process refund');
        }
    }
    async createSetupIntent(customerId, paymentMethodId) {
        try {
            const setupIntentData = {
                customer: customerId,
                automatic_payment_methods: {
                    enabled: true,
                },
            };
            if (paymentMethodId) {
                setupIntentData.payment_method = paymentMethodId;
                setupIntentData.confirm = true;
                setupIntentData.return_url = this.configService.get('FRONTEND_URL') + '/payments/setup';
            }
            return await this.stripe.setupIntents.create(setupIntentData);
        }
        catch (error) {
            this.logger.error('Failed to create setup intent:', error);
            throw new common_1.BadRequestException('Failed to setup payment method');
        }
    }
    async retrieveSetupIntent(setupIntentId) {
        try {
            return await this.stripe.setupIntents.retrieve(setupIntentId);
        }
        catch (error) {
            this.logger.error('Failed to retrieve setup intent:', error);
            throw new common_1.BadRequestException('Setup intent not found');
        }
    }
    async retrievePaymentMethod(paymentMethodId) {
        try {
            return await this.stripe.paymentMethods.retrieve(paymentMethodId);
        }
        catch (error) {
            this.logger.error('Failed to retrieve payment method:', error);
            throw new common_1.BadRequestException('Payment method not found');
        }
    }
    constructWebhookEvent(payload, signature) {
        const mode = this.configService.get('STRIPE_MODE', 'test');
        let webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (mode === 'live') {
            webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET_LIVE') || webhookSecret;
        }
        else {
            webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET_TEST') || webhookSecret;
        }
        if (!webhookSecret) {
            throw new Error(`STRIPE_WEBHOOK_SECRET is required for mode: ${mode}`);
        }
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (error) {
            this.logger.error('Webhook signature verification failed:', error);
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
    }
    formatAmountForDisplay(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    }
    convertToStripeAmount(amount) {
        return Math.round(amount * 100);
    }
    convertFromStripeAmount(amount) {
        return amount / 100;
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], StripeService);
//# sourceMappingURL=stripe.service.js.map