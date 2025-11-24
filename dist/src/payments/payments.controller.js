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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const payments_dto_1 = require("./dto/payments.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const stripe_webhook_service_1 = require("../common/services/stripe-webhook.service");
const stripe_service_1 = require("../common/services/stripe.service");
let PaymentsController = class PaymentsController {
    constructor(paymentsService, stripeWebhookService, stripeService) {
        this.paymentsService = paymentsService;
        this.stripeWebhookService = stripeWebhookService;
        this.stripeService = stripeService;
    }
    async getPaymentMethods(req) {
        return this.paymentsService.getUserPaymentMethods(req.user.id);
    }
    async addCard(req, addCardDto) {
        return this.paymentsService.addCardPaymentMethod(req.user.id, addCardDto);
    }
    async createCardSetupIntent(req) {
        return this.paymentsService.addCardPaymentMethodWithSetupIntent(req.user.id);
    }
    async confirmCardSetup(req, body) {
        return this.paymentsService.confirmSetupIntent(req.user.id, body.setupIntentId);
    }
    async addBankAccount(req, addBankAccountDto) {
        return this.paymentsService.addBankPaymentMethod(req.user.id, addBankAccountDto);
    }
    async createPaymentIntent(req, body) {
        return this.paymentsService.createPaymentIntent(req.user.id, body.amount, body.currency, body.paymentMethodId, body.transferId);
    }
    async confirmPaymentIntent(paymentIntentId, body) {
        return this.paymentsService.confirmPaymentIntent(paymentIntentId, body.paymentMethodId);
    }
    async getPaymentIntentStatus(paymentIntentId) {
        return this.paymentsService.getPaymentIntentStatus(paymentIntentId);
    }
    async createRefund(req, body) {
        return this.paymentsService.refundPayment(body.paymentIntentId, body.amount, body.reason);
    }
    async setDefaultPaymentMethod(req, id) {
        return this.paymentsService.setDefaultPaymentMethod(req.user.id, id);
    }
    async removePaymentMethod(req, id) {
        return this.paymentsService.removePaymentMethod(req.user.id, id);
    }
    async handleStripeWebhook(req, signature) {
        try {
            const event = this.stripeService.constructWebhookEvent(req.rawBody, signature);
            await this.stripeWebhookService.handleWebhookEvent(event);
            return { received: true };
        }
        catch (error) {
            console.error('Webhook error:', error);
            throw error;
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)('methods'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user payment methods',
        description: 'Retrieve all active payment methods (cards and bank accounts) for the authenticated user, ordered by default status.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment methods retrieved successfully',
        example: [
            {
                id: 'pm_123',
                type: 'CARD',
                isDefault: true,
                cardDetails: {
                    last4: '4242',
                    brand: 'visa',
                    expiryMonth: 12,
                    expiryYear: 2025
                },
                createdAt: '2024-11-14T10:00:00Z'
            }
        ]
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentMethods", null);
__decorate([
    (0, common_1.Post)('methods/card'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add card payment method (Direct - Not Recommended)',
        description: 'Add a card directly to the user account. This method is not PCI compliant and should not be used in production. Use setup-intent method instead.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Card added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid card details or card declined' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payments_dto_1.AddCardDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "addCard", null);
__decorate([
    (0, common_1.Post)('methods/card/setup-intent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create setup intent for adding card (PCI Compliant - Recommended)',
        description: 'Create a Stripe SetupIntent for securely adding a card using Stripe Elements on the frontend. This is the PCI compliant way to collect card details.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Setup intent created successfully',
        example: {
            setupIntentId: 'seti_1234567890',
            clientSecret: 'seti_1234567890_secret_abcd',
            customerId: 'cus_1234567890'
        }
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCardSetupIntent", null);
__decorate([
    (0, common_1.Post)('methods/card/confirm-setup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm setup intent after client-side completion',
        description: 'Confirm that the setup intent was completed successfully on the client side and save the payment method to the user account.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment method added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Setup intent not completed or failed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmCardSetup", null);
__decorate([
    (0, common_1.Post)('methods/bank'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add Nigerian bank account payment method',
        description: 'Add and verify a Nigerian bank account using Paystack verification. The account will be verified before being saved.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bank account added and verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bank account verification failed or invalid details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payments_dto_1.AddBankAccountDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "addBankAccount", null);
__decorate([
    (0, common_1.Post)('intents/create'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create payment intent for processing payments',
        description: 'Create a Stripe PaymentIntent for processing a payment. Use this for one-time payments or when you need more control over the payment flow.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment intent created successfully',
        example: {
            paymentIntentId: 'pi_1234567890',
            clientSecret: 'pi_1234567890_secret_abcd',
            status: 'requires_confirmation'
        }
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('intents/:id/confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm payment intent',
        description: 'Confirm a PaymentIntent to complete the payment. May trigger 3D Secure authentication if required.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment intent confirmed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Payment confirmation failed or requires additional authentication' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "confirmPaymentIntent", null);
__decorate([
    (0, common_1.Get)('intents/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get payment intent status',
        description: 'Check the current status of a PaymentIntent, including any errors or authentication requirements.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment intent status retrieved successfully',
        example: {
            paymentIntentId: 'pi_1234567890',
            status: 'succeeded',
            amount: 10000,
            currency: 'ngn',
            lastPaymentError: null
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentIntentStatus", null);
__decorate([
    (0, common_1.Post)('refunds'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create refund for a payment',
        description: 'Process a refund for a completed payment. Can be partial or full refund depending on the amount specified.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Refund created successfully',
        example: {
            refundId: 're_1234567890',
            amount: 5000,
            status: 'succeeded',
            reason: 'requested_by_customer'
        }
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createRefund", null);
__decorate([
    (0, common_1.Patch)('methods/:id/default'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set default payment method',
        description: 'Set a payment method as the default for future transactions. This will unset any other default payment methods.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Default payment method updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment method not found or does not belong to user' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "setDefaultPaymentMethod", null);
__decorate([
    (0, common_1.Delete)('methods/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove payment method',
        description: 'Remove a payment method from the user account. Cannot remove payment methods that have pending transfers.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment method removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment method not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot remove payment method with pending transfers' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "removePaymentMethod", null);
__decorate([
    (0, common_1.Post)('webhooks/stripe'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Stripe webhook endpoint (No Authentication Required)',
        description: 'Webhook endpoint for receiving Stripe events. This endpoint processes payment status updates, disputes, and other payment-related events automatically.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid webhook signature or malformed payload' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleStripeWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        stripe_webhook_service_1.StripeWebhookService,
        stripe_service_1.StripeService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map