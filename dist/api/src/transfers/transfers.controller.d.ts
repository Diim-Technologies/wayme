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
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TransferStatus;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        reference: string;
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
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TransferStatus;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        reference: string;
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
            sender: {
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransferStatus;
            senderId: string;
            receiverId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            fee: import("@prisma/client/runtime/library").Decimal;
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            sourceCurrency: string;
            targetCurrency: string;
            purpose: string;
            reference: string;
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
        transactions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string;
            processedAt: Date | null;
            transferId: string;
            currency: string;
            gatewayRef: string | null;
            gatewayData: import("@prisma/client/runtime/library").JsonValue | null;
            failureReason: string | null;
        }[];
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
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TransferStatus;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        reference: string;
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
        recipientBank: {
            id: string;
            code: string;
            name: string;
            country: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TransferStatus;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        reference: string;
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
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TransferStatus;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        reference: string;
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
