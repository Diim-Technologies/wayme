import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../common/services/paystack.service';
export declare class BanksService {
    private prisma;
    private paystackService;
    constructor(prisma: PrismaService, paystackService: PaystackService);
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
