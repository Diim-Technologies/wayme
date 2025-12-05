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
var StripeWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../entities");
const common_enum_1 = require("../../enums/common.enum");
let StripeWebhookService = StripeWebhookService_1 = class StripeWebhookService {
    constructor(transferRepository, transactionRepository, paymentMethodRepository, notificationRepository, userRepository, dataSource) {
        this.transferRepository = transferRepository;
        this.transactionRepository = transactionRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(StripeWebhookService_1.name);
    }
    async handleWebhookEvent(event) {
        this.logger.log(`Received webhook event: ${event.type} with ID: ${event.id}`);
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event);
                    break;
                case 'payment_intent.canceled':
                    await this.handlePaymentIntentCanceled(event);
                    break;
                case 'payment_intent.requires_action':
                    await this.handlePaymentIntentRequiresAction(event.data.object);
                    break;
                case 'payment_method.attached':
                    await this.handlePaymentMethodAttached(event.data.object);
                    break;
                case 'payment_method.detached':
                    await this.handlePaymentMethodDetached(event);
                    break;
                case 'setup_intent.succeeded':
                    await this.handleSetupIntentSucceeded(event);
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
    async handlePaymentIntentSucceeded(event) {
        const paymentIntent = event.data.object;
        this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);
        try {
            const transferId = paymentIntent.metadata?.transferId;
            if (!transferId) {
                this.logger.warn(`No transfer ID found in payment intent metadata: ${paymentIntent.id}`);
                return;
            }
            await this.dataSource.transaction(async (manager) => {
                await manager.update(entities_1.Transfer, { id: transferId }, {
                    status: common_enum_1.TransferStatus.PENDING,
                    processedAt: new Date(),
                });
                await manager.update(entities_1.Transaction, { transferId }, {
                    status: common_enum_1.TransactionStatus.SUCCESS,
                    gatewayRef: paymentIntent.id,
                    gatewayResponse: JSON.stringify({
                        status: paymentIntent.status,
                        amount: paymentIntent.amount,
                        currency: paymentIntent.currency,
                    }),
                });
                const transfer = await manager.findOne(entities_1.Transfer, {
                    where: { id: transferId },
                    relations: ['sender'],
                });
                if (transfer) {
                    const notification = manager.create(entities_1.Notification, {
                        userId: transfer.senderId,
                        type: common_enum_1.NotificationType.TRANSFER_SENT,
                        title: 'Payment Successful - Transfer Pending',
                        message: `Your payment of ₦${transfer.amount.toLocaleString()} was successful. Your transfer (Ref: ${transfer.reference}) is now pending admin approval.`,
                        data: {
                            transferId,
                            reference: transfer.reference,
                            amount: transfer.amount,
                            paymentIntentId: paymentIntent.id,
                            status: 'PENDING_APPROVAL',
                        },
                    });
                    await manager.save(entities_1.Notification, notification);
                }
            });
            this.logger.log(`Successfully processed payment intent: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process payment intent success: ${paymentIntent.id}`, error);
        }
    }
    async handlePaymentIntentFailed(event) {
        const paymentIntent = event.data.object;
        this.logger.log(`Payment intent failed: ${paymentIntent.id}`);
        try {
            const transferId = paymentIntent.metadata?.transferId;
            if (!transferId) {
                this.logger.warn(`No transfer ID found in payment intent metadata: ${paymentIntent.id}`);
                return;
            }
            const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
            await this.dataSource.transaction(async (manager) => {
                await manager.update(entities_1.Transfer, { id: transferId }, {
                    status: common_enum_1.TransferStatus.FAILED,
                });
                await manager.update(entities_1.Transaction, { transferId }, {
                    status: common_enum_1.TransactionStatus.FAILED,
                    gatewayRef: paymentIntent.id,
                    failureReason,
                    gatewayResponse: JSON.stringify({
                        status: paymentIntent.status,
                        error: paymentIntent.last_payment_error,
                    }),
                });
                const transfer = await manager.findOne(entities_1.Transfer, {
                    where: { id: transferId },
                    relations: ['sender'],
                });
                if (transfer) {
                    const notification = manager.create(entities_1.Notification, {
                        userId: transfer.senderId,
                        type: common_enum_1.NotificationType.TRANSFER_FAILED,
                        title: 'Transfer Failed',
                        message: `Your transfer of ₦${transfer.amount.toLocaleString()} has failed. Reason: ${failureReason}`,
                        data: {
                            transferId,
                            reference: transfer.reference,
                            amount: transfer.amount,
                            failureReason,
                            paymentIntentId: paymentIntent.id,
                        },
                    });
                    await manager.save(entities_1.Notification, notification);
                }
            });
            this.logger.log(`Successfully processed payment intent failure: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process payment intent failure: ${paymentIntent.id}`, error);
        }
    }
    async handlePaymentIntentCanceled(event) {
        const paymentIntent = event.data.object;
        this.logger.log(`Payment intent canceled: ${paymentIntent.id}`);
        try {
            const transferId = paymentIntent.metadata?.transferId;
            if (transferId) {
                await this.dataSource.transaction(async (manager) => {
                    await manager.update(entities_1.Transfer, { id: transferId }, {
                        status: common_enum_1.TransferStatus.CANCELLED,
                    });
                    await manager.update(entities_1.Transaction, { transferId }, {
                        status: common_enum_1.TransactionStatus.CANCELLED,
                        gatewayRef: paymentIntent.id,
                    });
                });
            }
            this.logger.log(`Successfully processed payment intent cancellation: ${paymentIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process payment intent cancellation: ${paymentIntent.id}`, error);
        }
    }
    async handlePaymentIntentRequiresAction(paymentIntent) {
        this.logger.log(`Payment requires action: ${paymentIntent.id}`);
        const transferId = paymentIntent.metadata?.transferId;
        if (!transferId)
            return;
        try {
            const transfer = await this.transferRepository.findOne({
                where: { id: transferId },
                relations: ['sender'],
            });
            if (transfer) {
                const notification = this.notificationRepository.create({
                    userId: transfer.senderId,
                    type: common_enum_1.NotificationType.SECURITY_ALERT,
                    title: 'Payment Requires Verification',
                    message: 'Your payment requires additional verification. Please complete the authentication process.',
                    data: {
                        transferId,
                        paymentIntentId: paymentIntent.id,
                        clientSecret: paymentIntent.client_secret,
                    },
                });
                await this.notificationRepository.save(notification);
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle payment requiring action for ${transferId}:`, error);
        }
    }
    async handlePaymentMethodAttached(paymentMethod) {
        this.logger.log(`Payment method attached: ${paymentMethod.id}`);
    }
    async handlePaymentMethodDetached(event) {
        const paymentMethod = event.data.object;
        this.logger.log(`Payment method detached: ${paymentMethod.id}`);
        try {
            await this.paymentMethodRepository.update({ stripeId: paymentMethod.id }, { isActive: false });
            this.logger.log(`Successfully processed payment method detachment: ${paymentMethod.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process payment method detachment: ${paymentMethod.id}`, error);
        }
    }
    async handleSetupIntentSucceeded(event) {
        const setupIntent = event.data.object;
        this.logger.log(`Setup intent succeeded: ${setupIntent.id}`);
        try {
            const userId = setupIntent.metadata?.userId;
            if (userId) {
                const transfer = await this.transferRepository.findOne({
                    where: { senderId: userId },
                    order: { createdAt: 'DESC' },
                });
                if (transfer) {
                    const notification = this.notificationRepository.create({
                        userId,
                        type: common_enum_1.NotificationType.PAYMENT_METHOD_ADDED,
                        title: 'Payment Method Added',
                        message: 'Your payment method has been successfully added to your account.',
                        data: {
                            setupIntentId: setupIntent.id,
                        },
                    });
                    await this.notificationRepository.save(notification);
                }
            }
            this.logger.log(`Successfully processed setup intent: ${setupIntent.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process setup intent: ${setupIntent.id}`, error);
        }
    }
    async handleSetupIntentFailed(setupIntent) {
        this.logger.log(`Setup intent failed: ${setupIntent.id}`);
    }
    async handleChargeDisputeCreated(dispute) {
        this.logger.log(`Charge dispute created: ${dispute.id} for charge: ${dispute.charge}`);
        try {
            const transaction = await this.transactionRepository.findOne({
                where: { gatewayRef: dispute.charge },
                relations: ['transfer', 'transfer.sender'],
            });
            if (transaction?.transfer) {
                const notification = this.notificationRepository.create({
                    userId: transaction.transfer.senderId,
                    type: common_enum_1.NotificationType.SECURITY_ALERT,
                    title: 'Payment Dispute',
                    message: `A dispute has been raised for your payment. We are reviewing the case and will contact you if additional information is needed.`,
                    data: {
                        disputeId: dispute.id,
                        transferId: transaction.transfer.id,
                        amount: dispute.amount,
                        reason: dispute.reason,
                    },
                });
                await this.notificationRepository.save(notification);
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
    async handleCustomerSubscriptionDeleted(event) {
        const subscription = event.data.object;
        this.logger.log(`Customer subscription deleted: ${subscription.id}`);
        try {
            const customerId = subscription.customer;
            const transaction = await this.transactionRepository.findOne({
                where: { gatewayRef: customerId },
                relations: ['transfer'],
            });
            if (transaction) {
                const notification = this.notificationRepository.create({
                    userId: transaction.transfer.senderId,
                    type: common_enum_1.NotificationType.SUBSCRIPTION_CANCELLED,
                    title: 'Subscription Cancelled',
                    message: 'Your subscription has been cancelled.',
                    data: {
                        subscriptionId: subscription.id,
                    },
                });
                await this.notificationRepository.save(notification);
            }
            this.logger.log(`Successfully processed subscription deletion: ${subscription.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process subscription deletion: ${subscription.id}`, error);
        }
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
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Transfer)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.PaymentMethod)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Notification)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], StripeWebhookService);
//# sourceMappingURL=stripe-webhook.service.js.map