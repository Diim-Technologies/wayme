import { Repository } from 'typeorm';
import { Bank } from '../entities';
import { PaystackService } from '../common/services/paystack.service';
export declare class BanksService {
    private bankRepository;
    private paystackService;
    constructor(bankRepository: Repository<Bank>, paystackService: PaystackService);
    getAllBanks(country?: string): Promise<Bank[]>;
    getBankByCode(code: string): Promise<Bank>;
    verifyAccountNumber(bankCode: string, accountNumber: string): Promise<{
        accountNumber: string;
        accountName: string;
        bankName: string;
        bankCode: string;
        isValid: boolean;
    }>;
    syncBanksFromPaystack(): Promise<{
        message: string;
        count: number;
        banks: any[];
    }>;
    seedBanks(): Promise<{
        message: string;
        count: number;
        banks: any[];
    }>;
}
