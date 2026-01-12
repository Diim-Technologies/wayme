import { Repository, DataSource } from 'typeorm';
import { Transfer, Transaction, PaymentMethod, Notification, User } from '../../entities';
import Stripe from 'stripe';
export declare class StripeWebhookService {
    private transferRepository;
    private transactionRepository;
    private paymentMethodRepository;
    private notificationRepository;
    private userRepository;
    private dataSource;
    private readonly logger;
    constructor(transferRepository: Repository<Transfer>, transactionRepository: Repository<Transaction>, paymentMethodRepository: Repository<PaymentMethod>, notificationRepository: Repository<Notification>, userRepository: Repository<User>, dataSource: DataSource);
    handleWebhookEvent(event: Stripe.Event): Promise<void>;
    handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void>;
    handlePaymentIntentFailed(event: Stripe.Event): Promise<void>;
    handlePaymentIntentCanceled(event: Stripe.Event): Promise<void>;
    handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<void>;
    handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod): Promise<void>;
    handlePaymentMethodDetached(event: Stripe.Event): Promise<void>;
    handleSetupIntentSucceeded(event: Stripe.Event): Promise<void>;
    handleSetupIntentFailed(setupIntent: Stripe.SetupIntent): Promise<void>;
    handleChargeDisputeCreated(dispute: Stripe.Dispute): Promise<void>;
    handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void>;
    handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void>;
    handleCustomerSubscriptionDeleted(event: Stripe.Event): Promise<void>;
    private formatAmount;
}
