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
var StripeWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let StripeWebhookService = StripeWebhookService_1 = class StripeWebhookService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(StripeWebhookService_1.name);
    }
    async handleWebhookEvent(event) {
        this.logger.log(`Received webhook event: ${event.type} with ID: ${event.id}`);
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;
                case 'payment_intent.canceled':
                    await this.handlePaymentIntentCanceled(event.data.object);
                    break;
                case 'payment_intent.requires_action':
                    await this.handlePaymentIntentRequiresAction(event.data.object);
                    break;
                case 'payment_method.attached':
                    await this.handlePaymentMethodAttached(event.data.object);
                    break;
                case 'payment_method.detached':
                    await this.handlePaymentMethodDetached(event.data.object);
                    break;
                case 'setup_intent.succeeded':
                    await this.handleSetupIntentSucceeded(event.data.object);
                    break;
                case 'setup_intent.setup_failed':
                    await this.handleSetupIntentFailed(event.data.object);
                    break;
                case 'charge.dispute.created':
                    await this.handleChargeDisputeCreated(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled webhook event type: ${event.type}`);
            }
        }
        catch (error) {
            this.logger.error(`Error handling webhook event ${event.type}:`, error);
            throw error;
        }
    }
    async handlePaymentIntentSucceeded(paymentIntent) {
        this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
        const transferId = paymentIntent.metadata?.transferId;
        if (!transferId) {
            this.logger.warn(`No transfer ID found in payment intent metadata: ${paymentIntent.id}`);
            return;
        }
        try {
            const transfer = await this.prisma.transfer.update({
                where: { id: transferId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
                include: {
                    sender: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                },
            });
            const gatewayData = {
                stripePaymentIntentId: paymentIntent.id,
                chargeId: typeof paymentIntent.latest_charge === 'string'
                    ? paymentIntent.latest_charge
                    : paymentIntent.latest_charge?.id ?? null,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                paymentMethod: typeof paymentIntent.payment_method === 'string'
                    ? paymentIntent.payment_method
                    : paymentIntent.payment_method?.id ?? null,
            };
            await this.prisma.transaction.updateMany({
                where: {
                    transferId,
                    type: 'DEBIT',
                    status: 'PENDING',
                },
                data: {
                    status: 'COMPLETED',
                    gatewayRef: paymentIntent.id,
                    gatewayData,
                    processedAt: new Date(),
                },
            });
            await this.prisma.notification.create({
                data: {
                    userId: transfer.senderId,
                    type: 'TRANSFER_COMPLETED',
                    title: 'Payment Successful',
                    message: `Your payment of ${this.formatAmount(paymentIntent.amount, paymentIntent.currency)} has been processed successfully.`,
                    data: {
                        transferId,
                        paymentIntentId: paymentIntent.id,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                    },
                },
            });
            this.logger.log(`Transfer ${transferId} marked as completed`);
        }
        catch (error) {
            this.logger.error(`Failed to update transfer ${transferId} after successful payment:`, error);
        }
    }
    async handlePaymentIntentFailed(paymentIntent) {
        this.logger.log(`Payment failed: ${paymentIntent.id}`);
        const transferId = paymentIntent.metadata?.transferId;
        if (!transferId) {
            this.logger.warn(`No transfer ID found in payment intent metadata: ${paymentIntent.id}`);
            return;
        }
        try {
            const failureReason = paymentIntent.last_payment_error?.message || 'Payment declined';
            const transfer = await this.prisma.transfer.update({
                where: { id: transferId },
                data: { status: 'FAILED' },
                include: {
                    sender: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                },
            });
            const errorData = paymentIntent.last_payment_error
                ? {
                    code: paymentIntent.last_payment_error.code,
                    message: paymentIntent.last_payment_error.message,
                    type: paymentIntent.last_payment_error.type,
                    decline_code: paymentIntent.last_payment_error.decline_code,
                    param: paymentIntent.last_payment_error.param,
                }
                : null;
            await this.prisma.transaction.updateMany({
                where: {
                    transferId,
                    type: 'DEBIT',
                    status: 'PENDING',
                },
                data: {
                    status: 'FAILED',
                    gatewayRef: paymentIntent.id,
                    failureReason,
                    gatewayData: {
                        stripePaymentIntentId: paymentIntent.id,
                        error: errorData,
                    },
                    processedAt: new Date(),
                },
            });
            await this.prisma.notification.create({
                data: {
                    userId: transfer.senderId,
                    type: 'TRANSFER_FAILED',
                    title: 'Payment Failed',
                    message: `Your payment failed: ${failureReason}. Please try again or use a different payment method.`,
                    data: {
                        transferId,
                        paymentIntentId: paymentIntent.id,
                        failureReason,
                    },
                },
            });
            this.logger.log(`Transfer ${transferId} marked as failed: ${failureReason}`);
        }
        catch (error) {
            this.logger.error(`Failed to update transfer ${transferId} after payment failure:`, error);
        }
    }
    async handlePaymentIntentCanceled(paymentIntent) {
        this.logger.log(`Payment canceled: ${paymentIntent.id}`);
        const transferId = paymentIntent.metadata?.transferId;
        if (!transferId)
            return;
        try {
            await this.prisma.transfer.update({
                where: { id: transferId },
                data: { status: 'CANCELLED' },
            });
            await this.prisma.transaction.updateMany({
                where: {
                    transferId,
                    type: 'DEBIT',
                    status: 'PENDING',
                },
                data: {
                    status: 'CANCELLED',
                    gatewayRef: paymentIntent.id,
                    processedAt: new Date(),
                },
            });
            this.logger.log(`Transfer ${transferId} marked as canceled`);
        }
        catch (error) {
            this.logger.error(`Failed to update transfer ${transferId} after cancellation:`, error);
        }
    }
    async handlePaymentIntentRequiresAction(paymentIntent) {
        this.logger.log(`Payment requires action: ${paymentIntent.id}`);
        const transferId = paymentIntent.metadata?.transferId;
        if (!transferId)
            return;
        try {
            const transfer = await this.prisma.transfer.findUnique({
                where: { id: transferId },
                include: { sender: true },
            });
            if (transfer) {
                await this.prisma.notification.create({
                    data: {
                        userId: transfer.senderId,
                        type: 'SECURITY_ALERT',
                        title: 'Payment Requires Verification',
                        message: 'Your payment requires additional verification. Please complete the authentication process.',
                        data: {
                            transferId,
                            paymentIntentId: paymentIntent.id,
                            clientSecret: paymentIntent.client_secret,
                        },
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle payment requiring action for ${transferId}:`, error);
        }
    }
    async handlePaymentMethodAttached(paymentMethod) {
        this.logger.log(`Payment method attached: ${paymentMethod.id}`);
    }
    async handlePaymentMethodDetached(paymentMethod) {
        this.logger.log(`Payment method detached: ${paymentMethod.id}`);
        try {
            await this.prisma.paymentMethod.updateMany({
                where: { stripeId: paymentMethod.id },
                data: { isActive: false },
            });
        }
        catch (error) {
            this.logger.error(`Failed to update detached payment method ${paymentMethod.id}:`, error);
        }
    }
    async handleSetupIntentSucceeded(setupIntent) {
        this.logger.log(`Setup intent succeeded: ${setupIntent.id}`);
    }
    async handleSetupIntentFailed(setupIntent) {
        this.logger.log(`Setup intent failed: ${setupIntent.id}`);
    }
    async handleChargeDisputeCreated(dispute) {
        this.logger.log(`Charge dispute created: ${dispute.id} for charge: ${dispute.charge}`);
        try {
            const transaction = await this.prisma.transaction.findFirst({
                where: { gatewayRef: dispute.charge },
                include: {
                    transfer: {
                        include: { sender: true },
                    },
                },
            });
            if (transaction?.transfer) {
                await this.prisma.notification.create({
                    data: {
                        userId: transaction.transfer.senderId,
                        type: 'SECURITY_ALERT',
                        title: 'Payment Dispute',
                        message: `A dispute has been raised for your payment. We are reviewing the case and will contact you if additional information is needed.`,
                        data: {
                            disputeId: dispute.id,
                            transferId: transaction.transfer.id,
                            amount: dispute.amount,
                            reason: dispute.reason,
                        },
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle dispute ${dispute.id}:`, error);
        }
    }
    async handleInvoicePaymentSucceeded(invoice) {
        this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
    }
    async handleInvoicePaymentFailed(invoice) {
        this.logger.log(`Invoice payment failed: ${invoice.id}`);
    }
    formatAmount(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    }
};
exports.StripeWebhookService = StripeWebhookService;
exports.StripeWebhookService = StripeWebhookService = StripeWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StripeWebhookService);
//# sourceMappingURL=stripe-webhook.service.js.map