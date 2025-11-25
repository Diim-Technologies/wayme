import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
export declare class StripeWebhookService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleWebhookEvent(event: Stripe.Event): Promise<void>;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    private handlePaymentIntentCanceled;
    private handlePaymentIntentRequiresAction;
    private handlePaymentMethodAttached;
    private handlePaymentMethodDetached;
    private handleSetupIntentSucceeded;
    private handleSetupIntentFailed;
    private handleChargeDisputeCreated;
    private handleInvoicePaymentSucceeded;
    private handleInvoicePaymentFailed;
    private formatAmount;
}
