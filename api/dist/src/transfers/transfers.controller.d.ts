import { TransfersService } from './transfers.service';
import { CreateTransferDto, TransferQuoteDto } from './dto/transfers.dto';
export declare class TransfersController {
    private transfersService;
    constructor(transfersService: TransfersService);
    createTransfer(req: any, createTransferDto: CreateTransferDto): Promise<({
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
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
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
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
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
    getQuote(quoteDto: TransferQuoteDto): Promise<{
        sourceAmount: import("@prisma/client/runtime/library").Decimal;
        targetAmount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        transferFee: import("@prisma/client/runtime/library").Decimal;
        conversionFee: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        totalCost: import("@prisma/client/runtime/library").Decimal;
    }>;
    getQuoteViaGet(amount: number, sourceCurrency?: string, targetCurrency?: string, paymentMethodType?: string): Promise<{
        sourceAmount: import("@prisma/client/runtime/library").Decimal;
        targetAmount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        transferFee: import("@prisma/client/runtime/library").Decimal;
        conversionFee: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        totalCost: import("@prisma/client/runtime/library").Decimal;
    }>;
    getUserTransfers(req: any, page?: number, limit?: number, status?: string): Promise<{
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
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            reference: string;
            senderId: string;
            receiverId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            fee: import("@prisma/client/runtime/library").Decimal;
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
    getTransferById(req: any, id: string): Promise<{
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
            amount: import("@prisma/client/runtime/library").Decimal;
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
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
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
    cancelTransfer(req: any, id: string): Promise<{
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
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
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
    createTransferWithPayment(req: any, createTransferDto: CreateTransferDto): Promise<{
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
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
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
}
