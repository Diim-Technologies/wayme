import { BanksService } from './banks.service';
export declare class BanksController {
    private banksService;
    constructor(banksService: BanksService);
    getAllBanks(country?: string): Promise<{
        id: string;
        code: string;
        name: string;
        country: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getBankByCode(code: string): Promise<{
        id: string;
        code: string;
        name: string;
        country: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
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
