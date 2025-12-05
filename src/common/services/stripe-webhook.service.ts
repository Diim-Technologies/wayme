import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transfer, Transaction, PaymentMethod, Notification, User } from '../../entities';
import { TransferStatus, TransactionStatus, NotificationType } from '../../enums/common.enum';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) { }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
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
          await this.handlePaymentIntentRequiresAction(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_method.attached':
          await this.handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
          break;

        case 'payment_method.detached':
          await this.handlePaymentMethodDetached(event);
          break;

        case 'setup_intent.succeeded':
          await this.handleSetupIntentSucceeded(event);
          break;

        case 'setup_intent.setup_failed':
          await this.handleSetupIntentFailed(event.data.object as Stripe.SetupIntent);
          break;

        case 'charge.dispute.created':
          await this.handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook event ${event.type}:`, error);
      throw error;
    }
  }

  async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);

    try {
      // Find the transfer associated with this payment intent
      const transferId = paymentIntent.metadata?.transferId;
      if (!transferId) {
        this.logger.warn(`No transfer ID found in payment intent metadata: ${paymentIntent.id}`);
        return;
      }

      await this.dataSource.transaction(async (manager) => {
        // Update transfer status to PENDING (awaiting admin approval)
        await manager.update(Transfer, { id: transferId }, {
          status: TransferStatus.PENDING,
          processedAt: new Date(),
        });

        // Update related transactions
        await manager.update(Transaction, { transferId }, {
          status: TransactionStatus.SUCCESS,
          gatewayRef: paymentIntent.id,
          gatewayResponse: JSON.stringify({
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          }),
        });

        // Create payment success notification (transfer pending admin approval)
        const transfer = await manager.findOne(Transfer, {
          where: { id: transferId },
          relations: ['sender'],
        });

        if (transfer) {
          const notification = manager.create(Notification, {
            userId: transfer.senderId,
            type: NotificationType.TRANSFER_SENT,
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
          await manager.save(Notification, notification);
        }
      });

      this.logger.log(`Successfully processed payment intent: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(`Failed to process payment intent success: ${paymentIntent.id}`, error);
    }
  }

  async handlePaymentIntentFailed(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    this.logger.log(`Payment intent failed: ${paymentIntent.id}`);

    try {
      const transferId = paymentIntent.metadata?.transferId;
      if (!transferId) {
        this.logger.warn(`No transfer ID found in payment intent metadata: ${paymentIntent.id}`);
        return;
      }

      const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';

      await this.dataSource.transaction(async (manager) => {
        // Update transfer status to failed
        await manager.update(Transfer, { id: transferId }, {
          status: TransferStatus.FAILED,
        });

        // Update related transactions
        await manager.update(Transaction, { transferId }, {
          status: TransactionStatus.FAILED,
          gatewayRef: paymentIntent.id,
          failureReason,
          gatewayResponse: JSON.stringify({
            status: paymentIntent.status,
            error: paymentIntent.last_payment_error,
          }),
        });

        // Create failure notification
        const transfer = await manager.findOne(Transfer, {
          where: { id: transferId },
          relations: ['sender'],
        });

        if (transfer) {
          const notification = manager.create(Notification, {
            userId: transfer.senderId,
            type: NotificationType.TRANSFER_FAILED,
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
          await manager.save(Notification, notification);
        }
      });

      this.logger.log(`Successfully processed payment intent failure: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(`Failed to process payment intent failure: ${paymentIntent.id}`, error);
    }
  }

  async handlePaymentIntentCanceled(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    this.logger.log(`Payment intent canceled: ${paymentIntent.id}`);

    try {
      const transferId = paymentIntent.metadata?.transferId;
      if (transferId) {
        await this.dataSource.transaction(async (manager) => {
          await manager.update(Transfer, { id: transferId }, {
            status: TransferStatus.CANCELLED,
          });

          await manager.update(Transaction, { transferId }, {
            status: TransactionStatus.CANCELLED,
            gatewayRef: paymentIntent.id,
          });
        });
      }

      this.logger.log(`Successfully processed payment intent cancellation: ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(`Failed to process payment intent cancellation: ${paymentIntent.id}`, error);
    }
  }

  async handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    this.logger.log(`Payment requires action: ${paymentIntent.id}`);

    const transferId = paymentIntent.metadata?.transferId;
    if (!transferId) return;

    try {
      const transfer = await this.transferRepository.findOne({
        where: { id: transferId },
        relations: ['sender'],
      });

      if (transfer) {
        const notification = this.notificationRepository.create({
          userId: transfer.senderId,
          type: NotificationType.SECURITY_ALERT,
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
    } catch (error) {
      this.logger.error(`Failed to handle payment requiring action for ${transferId}:`, error);
    }
  }

  async handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void> {
    this.logger.log(`Payment method attached: ${paymentMethod.id}`);
  }

  async handlePaymentMethodDetached(event: Stripe.Event) {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;

    this.logger.log(`Payment method detached: ${paymentMethod.id}`);

    try {
      // Deactivate the payment method in our database
      await this.paymentMethodRepository.update(
        { stripeId: paymentMethod.id },
        { isActive: false }
      );

      this.logger.log(`Successfully processed payment method detachment: ${paymentMethod.id}`);
    } catch (error) {
      this.logger.error(`Failed to process payment method detachment: ${paymentMethod.id}`, error);
    }
  }

  async handleSetupIntentSucceeded(event: Stripe.Event) {
    const setupIntent = event.data.object as Stripe.SetupIntent;

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
            type: NotificationType.PAYMENT_METHOD_ADDED,
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
    } catch (error) {
      this.logger.error(`Failed to process setup intent: ${setupIntent.id}`, error);
    }
  }

  async handleSetupIntentFailed(setupIntent: Stripe.SetupIntent): Promise<void> {
    this.logger.log(`Setup intent failed: ${setupIntent.id}`);
  }

  async handleChargeDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    this.logger.log(`Charge dispute created: ${dispute.id} for charge: ${dispute.charge}`);

    try {
      const transaction = await this.transactionRepository.findOne({
        where: { gatewayRef: dispute.charge as string },
        relations: ['transfer', 'transfer.sender'],
      });

      if (transaction?.transfer) {
        const notification = this.notificationRepository.create({
          userId: transaction.transfer.senderId,
          type: NotificationType.SECURITY_ALERT,
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
    } catch (error) {
      this.logger.error(`Failed to handle dispute ${dispute.id}:`, error);
    }
  }

  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
  }

  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice payment failed: ${invoice.id}`);
  }

  async handleCustomerSubscriptionDeleted(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;

    this.logger.log(`Customer subscription deleted: ${subscription.id}`);

    try {
      // Handle subscription cancellation if applicable
      const customerId = subscription.customer as string;
      const transaction = await this.transactionRepository.findOne({
        where: { gatewayRef: customerId },
        relations: ['transfer'],
      });

      if (transaction) {
        const notification = this.notificationRepository.create({
          userId: transaction.transfer.senderId,
          type: NotificationType.SUBSCRIPTION_CANCELLED,
          title: 'Subscription Cancelled',
          message: 'Your subscription has been cancelled.',
          data: {
            subscriptionId: subscription.id,
          },
        });
        await this.notificationRepository.save(notification);
      }

      this.logger.log(`Successfully processed subscription deletion: ${subscription.id}`);
    } catch (error) {
      this.logger.error(`Failed to process subscription deletion: ${subscription.id}`, error);
    }
  }

  private formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }
}
