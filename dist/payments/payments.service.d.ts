import { Repository, DataSource } from 'typeorm';
import { PaymentMethod, User, Transfer, Transaction } from '../entities';
import { PaymentMethodType } from '../enums/common.enum';
import { ConfigService } from '@nestjs/config';
import { PaystackService } from '../common/services/paystack.service';
import { StripeService } from '../common/services/stripe.service';
export declare class PaymentsService {
    private paymentMethodRepository;
    private userRepository;
    private transferRepository;
    private transactionRepository;
    private dataSource;
    private configService;
    private paystackService;
    private stripeService;
    constructor(paymentMethodRepository: Repository<PaymentMethod>, userRepository: Repository<User>, transferRepository: Repository<Transfer>, transactionRepository: Repository<Transaction>, dataSource: DataSource, configService: ConfigService, paystackService: PaystackService, stripeService: StripeService);
    getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
    addCardPaymentMethod(userId: string, cardData: {
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvc: string;
        holderName: string;
    }): Promise<PaymentMethod>;
    addCardPaymentMethodWithSetupIntent(userId: string): Promise<{
        setupIntentId: string;
        clientSecret: string;
        customerId: string;
    }>;
    confirmSetupIntent(userId: string, setupIntentId: string): Promise<PaymentMethod>;
    addBankPaymentMethod(userId: string, bankData: any): Promise<PaymentMethod>;
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
    setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod>;
    removePaymentMethod(userId: string, paymentMethodId: string): Promise<{
        isActive: false;
        id: string;
        userId: string;
        type: PaymentMethodType;
        isDefault: boolean;
        cardDetails: any;
        bankDetails: any;
        stripeId: string;
        createdAt: Date;
        updatedAt: Date;
        user: User;
        transfers: Transfer[];
    } & PaymentMethod>;
}
