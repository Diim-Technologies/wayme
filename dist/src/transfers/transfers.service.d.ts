import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto, TransferQuoteDto } from './dto/transfers.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
import { StripeService } from '../common/services/stripe.service';
export declare class TransfersService {
    private prisma;
    private currencyService;
    private feeService;
    private stripeService;
    constructor(prisma: PrismaService, currencyService: CurrencyService, feeService: FeeService, stripeService: StripeService);
    createTransfer(userId: string, createTransferDto: CreateTransferDto): Promise<({
        paymentMethod: {
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
        };
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
        receiver: {
            email: string;
            firstName: string;
            lastName: string;
        };
        recipientBank: {
            id: string;
            code: string;
            name: string;
            country: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        exchangeRate: Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: Decimal;
        fee: Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        status: import(".prisma/client").$Enums.TransferStatus;
        paymentMethodId: string;
        recipientBankId: string | null;
        recipientAccount: string | null;
        recipientName: string | null;
        recipientPhone: string | null;
        notes: string | null;
        processedAt: Date | null;
        completedAt: Date | null;
    }) | {
        paymentIntent: {
            id: string;
            clientSecret: string;
            status: import("stripe").Stripe.PaymentIntent.Status;
        };
        paymentMethod: {
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
        };
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
        receiver: {
            email: string;
            firstName: string;
            lastName: string;
        };
        recipientBank: {
            id: string;
            code: string;
            name: string;
            country: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        exchangeRate: Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: Decimal;
        fee: Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        status: import(".prisma/client").$Enums.TransferStatus;
        paymentMethodId: string;
        recipientBankId: string | null;
        recipientAccount: string | null;
        recipientName: string | null;
        recipientPhone: string | null;
        notes: string | null;
        processedAt: Date | null;
        completedAt: Date | null;
    }>;
    createTransferWithPaymentIntent(userId: string, createTransferDto: CreateTransferDto): Promise<{
        paymentMethod: {
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
        };
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
        receiver: {
            email: string;
            firstName: string;
            lastName: string;
        };
        recipientBank: {
            id: string;
            code: string;
            name: string;
            country: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        exchangeRate: Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: Decimal;
        fee: Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        status: import(".prisma/client").$Enums.TransferStatus;
        paymentMethodId: string;
        recipientBankId: string | null;
        recipientAccount: string | null;
        recipientName: string | null;
        recipientPhone: string | null;
        notes: string | null;
        processedAt: Date | null;
        completedAt: Date | null;
    }>;
    getTransferById(id: string, userId: string): Promise<{
        paymentMethod: {
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
        };
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
        transactions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            currency: string;
            transferId: string;
            reference: string;
            amount: Decimal;
            status: import(".prisma/client").$Enums.TransactionStatus;
            processedAt: Date | null;
            gatewayRef: string | null;
            gatewayData: import("@prisma/client/runtime/library").JsonValue | null;
            failureReason: string | null;
        }[];
        receiver: {
            email: string;
            firstName: string;
            lastName: string;
        };
        recipientBank: {
            id: string;
            code: string;
            name: string;
            country: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        exchangeRate: Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: Decimal;
        fee: Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        status: import(".prisma/client").$Enums.TransferStatus;
        paymentMethodId: string;
        recipientBankId: string | null;
        recipientAccount: string | null;
        recipientName: string | null;
        recipientPhone: string | null;
        notes: string | null;
        processedAt: Date | null;
        completedAt: Date | null;
    }>;
    getUserTransfers(userId: string, page?: number, limit?: number, status?: string): Promise<{
        transfers: ({
            sender: {
                email: string;
                firstName: string;
                lastName: string;
            };
            receiver: {
                email: string;
                firstName: string;
                lastName: string;
            };
            recipientBank: {
                id: string;
                code: string;
                name: string;
                country: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            exchangeRate: Decimal | null;
            reference: string;
            senderId: string;
            receiverId: string | null;
            amount: Decimal;
            fee: Decimal;
            sourceCurrency: string;
            targetCurrency: string;
            purpose: string;
            status: import(".prisma/client").$Enums.TransferStatus;
            paymentMethodId: string;
            recipientBankId: string | null;
            recipientAccount: string | null;
            recipientName: string | null;
            recipientPhone: string | null;
            notes: string | null;
            processedAt: Date | null;
            completedAt: Date | null;
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getQuote(quoteDto: TransferQuoteDto): Promise<{
        sourceAmount: Decimal;
        targetAmount: Decimal;
        fee: Decimal;
        transferFee: Decimal;
        conversionFee: Decimal;
        exchangeRate: Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        totalCost: Decimal;
    }>;
    cancelTransfer(id: string, userId: string): Promise<{
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
        recipientBank: {
            id: string;
            code: string;
            name: string;
            country: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        exchangeRate: Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: Decimal;
        fee: Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        status: import(".prisma/client").$Enums.TransferStatus;
        paymentMethodId: string;
        recipientBankId: string | null;
        recipientAccount: string | null;
        recipientName: string | null;
        recipientPhone: string | null;
        notes: string | null;
        processedAt: Date | null;
        completedAt: Date | null;
    }>;
    private calculateQuote;
    private fallbackCalculateQuote;
    private generateReference;
}
