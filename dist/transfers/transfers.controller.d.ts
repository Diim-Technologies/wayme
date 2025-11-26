import { TransfersService } from './transfers.service';
import { CreateTransferDto, TransferQuoteDto } from './dto/transfers.dto';
export declare class TransfersController {
    private transfersService;
    constructor(transfersService: TransfersService);
    createTransfer(req: any, createTransferDto: CreateTransferDto): Promise<import("../entities").Transfer | {
        paymentIntent: {
            id: string;
            clientSecret: string;
            status: import("stripe").Stripe.PaymentIntent.Status;
        };
        id: string;
        senderId: string;
        receiverId: string;
        amount: number;
        fee: number;
        exchangeRate: number;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        status: import("../enums/common.enum").TransferStatus;
        reference: string;
        paymentMethodId: string;
        recipientBankId: string;
        recipientAccount: string;
        recipientName: string;
        recipientPhone: string;
        notes: string;
        processedAt: Date;
        completedAt: Date;
        createdAt: Date;
        updatedAt: Date;
        transactions: any[];
        paymentMethod: any;
        receiver: any;
        recipientBank: any;
        sender: any;
    }>;
    getQuote(quoteDto: TransferQuoteDto): Promise<{
        sourceAmount: import("decimal.js").Decimal;
        targetAmount: import("decimal.js").Decimal;
        fee: import("decimal.js").Decimal;
        transferFee: import("decimal.js").Decimal;
        conversionFee: import("decimal.js").Decimal;
        exchangeRate: import("decimal.js").Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        totalCost: import("decimal.js").Decimal;
    }>;
    getQuoteViaGet(amount: number, sourceCurrency?: string, targetCurrency?: string, paymentMethodType?: string): Promise<{
        sourceAmount: import("decimal.js").Decimal;
        targetAmount: import("decimal.js").Decimal;
        fee: import("decimal.js").Decimal;
        transferFee: import("decimal.js").Decimal;
        conversionFee: import("decimal.js").Decimal;
        exchangeRate: import("decimal.js").Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        totalCost: import("decimal.js").Decimal;
    }>;
    getUserTransfers(req: any, page?: number, limit?: number, status?: string): Promise<{
        transfers: import("../entities").Transfer[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getTransferById(req: any, id: string): Promise<import("../entities").Transfer>;
    cancelTransfer(req: any, id: string): Promise<import("../entities").Transfer>;
    createTransferWithPayment(req: any, createTransferDto: CreateTransferDto): Promise<import("../entities").Transfer>;
}
