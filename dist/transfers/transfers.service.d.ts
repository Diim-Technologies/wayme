import { Repository } from 'typeorm';
import { Transfer } from '../entities/transfer.entity';
import { User } from '../entities/user.entity';
import { TransferStatus } from '../enums/common.enum';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
import { TransferQuoteDto, TransferQuoteResponseDto } from './dto/transfer-quote.dto';
import { CreateTransferDto, ProceedToTransferResponseDto } from './dto/create-transfer.dto';
export declare class TransfersService {
    private transferRepository;
    private userRepository;
    private currencyService;
    private feeService;
    private readonly logger;
    constructor(transferRepository: Repository<Transfer>, userRepository: Repository<User>, currencyService: CurrencyService, feeService: FeeService);
    getTransferQuote(dto: TransferQuoteDto): Promise<TransferQuoteResponseDto>;
    proceedToTransfer(userId: string, dto: CreateTransferDto): Promise<ProceedToTransferResponseDto>;
    getTransferByReference(reference: string, userId?: string): Promise<Transfer>;
    getTransferById(id: string): Promise<Transfer>;
    getUserTransfers(userId: string, page?: number, limit?: number, status?: TransferStatus): Promise<{
        data: Transfer[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    approveTransfer(transferId: string, adminId: string, notes?: string): Promise<Transfer>;
    updateTransferPaymentMethod(transferId: string, paymentMethodId: string): Promise<void>;
    private generateReferenceId;
}
