import { BanksService } from './banks.service';
export declare class BanksController {
    private banksService;
    constructor(banksService: BanksService);
    getAllBanks(country?: string): Promise<import("../entities").Bank[]>;
    getBankByCode(code: string): Promise<import("../entities").Bank>;
    verifyAccountNumber(bankCode: string, accountNumber: string): Promise<{
        accountNumber: string;
        accountName: string;
        bankName: string;
        bankCode: string;
        isValid: boolean;
    }>;
    seedBanks(): Promise<{
        message: string;
        count: number;
        banks: any[];
    }>;
    syncBanksFromPaystack(): Promise<{
        message: string;
        count: number;
        banks: any[];
    }>;
}
