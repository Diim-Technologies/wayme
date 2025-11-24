import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PaystackService } from '../common/services/paystack.service';
import { StripeService } from '../common/services/stripe.service';
export declare class PaymentsService {
    private prisma;
    private configService;
    private paystackService;
    private stripeService;
    constructor(prisma: PrismaService, configService: ConfigService, paystackService: PaystackService, stripeService: StripeService);
    getUserPaymentMethods(userId: string): Promise<{
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
    addCardPaymentMethod(userId: string, cardData: {
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvc: string;
        holderName: string;
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
    addCardPaymentMethodWithSetupIntent(userId: string): Promise<{
        setupIntentId: string;
        clientSecret: string;
        customerId: string;
    }>;
    confirmSetupIntent(userId: string, setupIntentId: string): Promise<{
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
    addBankPaymentMethod(userId: string, bankData: any): Promise<{
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
    createPaymentIntent(userId: string, amount: number, currency: string, paymentMethodId?: string, transferId?: string): Promise<{
        paymentIntentId: string;
        clientSecret: string;
        status: import("stripe").Stripe.PaymentIntent.Status;
    }>;
    confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<{
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
    refundPayment(paymentIntentId: string, amount?: number, reason?: string): Promise<{
        refundId: string;
        amount: number;
        status: string;
        reason: import("stripe").Stripe.Refund.Reason;
    }>;
    setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<{
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
    removePaymentMethod(userId: string, paymentMethodId: string): Promise<{
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
}
