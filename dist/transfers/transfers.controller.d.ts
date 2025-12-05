import { TransfersService } from './transfers.service';
import { TransferQuoteDto, TransferQuoteResponseDto } from './dto/transfer-quote.dto';
import { CreateTransferDto, ProceedToTransferResponseDto, ApproveTransferDto } from './dto/create-transfer.dto';
export declare class TransfersController {
    private readonly transfersService;
    constructor(transfersService: TransfersService);
    getQuote(dto: TransferQuoteDto): Promise<TransferQuoteResponseDto>;
    proceedToTransfer(req: any, dto: CreateTransferDto): Promise<ProceedToTransferResponseDto>;
    getTransferByReference(req: any, reference: string): Promise<import("../entities").Transfer>;
    getUserTransfers(req: any, page?: number, limit?: number, status?: string): Promise<{
        data: import("../entities").Transfer[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    approveTransfer(req: any, id: string, dto: ApproveTransferDto): Promise<import("../entities").Transfer>;
}
