import { ConfigService } from '@nestjs/config';
export interface PaystackBankVerificationResponse {
    status: boolean;
    message: string;
    data: {
        account_number: string;
        account_name: string;
        bank_id: number;
    };
}
export interface PaystackBankListResponse {
    status: boolean;
    message: string;
    data: Array<{
        id: number;
        name: string;
        slug: string;
        code: string;
        longcode: string;
        gateway: string;
        pay_with_bank: boolean;
        active: boolean;
        country: string;
        currency: string;
        type: string;
        is_deleted: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
}
export declare class PaystackService {
    private configService;
    private readonly baseUrl;
    private readonly secretKey;
    constructor(configService: ConfigService);
    private getHeaders;
    verifyBankAccount(accountNumber: string, bankCode: string): Promise<{
        accountNumber: string;
        accountName: string;
        bankId: number;
        isValid: boolean;
    }>;
    getBankList(): Promise<{
        id: number;
        name: string;
        code: string;
        slug: string;
        longcode: string;
    }[]>;
    validateBankCode(bankCode: string): Promise<boolean>;
}
