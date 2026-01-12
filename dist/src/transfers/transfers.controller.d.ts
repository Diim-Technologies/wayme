import { TransfersService } from './transfers.service';
import { TransferQuoteDto, TransferQuoteResponseDto } from './dto/transfer-quote.dto';
import { CreateTransferDto, ProceedToTransferResponseDto, ApproveTransferDto } from './dto/create-transfer.dto';
export declare class TransfersController {
    private readonly transfersService;
    constructor(transfersService: TransfersService);
    getQuote(dto: TransferQuoteDto): Promise<TransferQuoteResponseDto>;
    proceedToTransfer(req: any, dto: CreateTransferDto): Promise<ProceedToTransferResponseDto>;
    getUserTransfers(req: any, page?: number, limit?: number, status?: string): Promise<{
        data: {
            convertedAmount: number;
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
            transactions: import("../entities").Transaction[];
            paymentMethod: import("../entities").PaymentMethod;
            receiver: import("../entities").User;
            recipientBank: import("../entities").Bank;
            sender: import("../entities").User;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getTransferByReference(req: any, reference: string): Promise<import("../entities").Transfer>;
    approveTransfer(req: any, id: string, dto: ApproveTransferDto): Promise<import("../entities").Transfer>;
}
