import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
export declare class StripeService {
    private configService;
    private prisma;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService, prisma: PrismaService);
    createCustomer(userId: string, email: string, name: string): Promise<Stripe.Customer>;
    getOrCreateCustomer(userId: string, email: string, name: string): Promise<Stripe.Customer>;
    createPaymentMethod(customerId: string, paymentMethodData: {
        type: 'card';
        card: {
            number: string;
            exp_month: number;
            exp_year: number;
            cvc: string;
        };
    }): Promise<Stripe.PaymentMethod>;
    attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod>;
    detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
    listCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]>;
    createPaymentIntent(amount: number, currency: string, customerId: string, paymentMethodId?: string, metadata?: Record<string, string>): Promise<Stripe.PaymentIntent>;
    confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent>;
    retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    createRefund(paymentIntentId: string, amount?: number, reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'): Promise<Stripe.Refund>;
    createSetupIntent(customerId: string, paymentMethodId?: string): Promise<Stripe.SetupIntent>;
    retrieveSetupIntent(setupIntentId: string): Promise<Stripe.SetupIntent>;
    retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
    constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event;
    formatAmountForDisplay(amount: number, currency: string): string;
    convertToStripeAmount(amount: number): number;
    convertFromStripeAmount(amount: number): number;
}
