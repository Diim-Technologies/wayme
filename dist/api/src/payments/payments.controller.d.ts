import { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AddCardDto, AddBankAccountDto } from './dto/payments.dto';
import { StripeWebhookService } from '../common/services/stripe-webhook.service';
import { StripeService } from '../common/services/stripe.service';
export declare class PaymentsController {
    private paymentsService;
    private stripeWebhookService;
    private stripeService;
    constructor(paymentsService: PaymentsService, stripeWebhookService: StripeWebhookService, stripeService: StripeService);
    getPaymentMethods(req: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PaymentMethodType;
        userId: string;
        isDefault: boolean;
        cardDetails: import("@prisma/client/runtime/library").JsonValue | null;
        bankDetails: import("@prisma/client/runtime/library").JsonValue | null;
        stripeId: string | null;
    }[]>;
    addCard(req: any, addCardDto: AddCardDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PaymentMethodType;
        userId: string;
        isDefault: boolean;
        cardDetails: import("@prisma/client/runtime/library").JsonValue | null;
        bankDetails: import("@prisma/client/runtime/library").JsonValue | null;
        stripeId: string | null;
    }>;
    createCardSetupIntent(req: any): Promise<{
        setupIntentId: string;
        clientSecret: string;
        customerId: string;
    }>;
    confirmCardSetup(req: any, body: {
        setupIntentId: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PaymentMethodType;
        userId: string;
        isDefault: boolean;
        cardDetails: import("@prisma/client/runtime/library").JsonValue | null;
        bankDetails: import("@prisma/client/runtime/library").JsonValue | null;
        stripeId: string | null;
    }>;
    addBankAccount(req: any, addBankAccountDto: AddBankAccountDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PaymentMethodType;
        userId: string;
        isDefault: boolean;
        cardDetails: import("@prisma/client/runtime/library").JsonValue | null;
        bankDetails: import("@prisma/client/runtime/library").JsonValue | null;
        stripeId: string | null;
    }>;
    createPaymentIntent(req: any, body: {
        amount: number;
        currency: string;
        paymentMethodId?: string;
        transferId?: string;
    }): Promise<{
        paymentIntentId: string;
        clientSecret: string;
        status: import("stripe").Stripe.PaymentIntent.Status;
    }>;
    confirmPaymentIntent(paymentIntentId: string, body: {
        paymentMethodId?: string;
    }): Promise<{
        paymentIntentId: string;
        status: import("stripe").Stripe.PaymentIntent.Status;
        clientSecret: string;
    }>;
    getPaymentIntentStatus(paymentIntentId: string): Promise<{
        paymentIntentId: string;
        status: import("stripe").Stripe.PaymentIntent.Status;
        amount: number;
        currency: string;
        lastPaymentError: import("stripe").Stripe.PaymentIntent.LastPaymentError;
    }>;
    createRefund(req: any, body: {
        paymentIntentId: string;
        amount?: number;
        reason?: string;
    }): Promise<{
        refundId: string;
        amount: number;
        status: string;
        reason: import("stripe").Stripe.Refund.Reason;
    }>;
    setDefaultPaymentMethod(req: any, id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PaymentMethodType;
        userId: string;
        isDefault: boolean;
        cardDetails: import("@prisma/client/runtime/library").JsonValue | null;
        bankDetails: import("@prisma/client/runtime/library").JsonValue | null;
        stripeId: string | null;
    }>;
    removePaymentMethod(req: any, id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.PaymentMethodType;
        userId: string;
        isDefault: boolean;
        cardDetails: import("@prisma/client/runtime/library").JsonValue | null;
        bankDetails: import("@prisma/client/runtime/library").JsonValue | null;
        stripeId: string | null;
    }>;
    handleStripeWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
