import { AdminService } from './admin.service';
import { UpdateUserRoleDto, UpdateKycStatusDto, UpdateTransferStatusDto, CreateExchangeRateDto, CreateAdminUserDto, CreateFeeConfigurationDto, UpdateFeeConfigurationDto, RequestAdminVerificationDto, VerifyAdminOtpDto } from './dto/admin.dto';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getDashboardStats(): Promise<import("./dto/admin.dto").AdminStatsDto>;
    getSystemLogs(page?: number, limit?: number): Promise<{
        logs: {
            type: string;
            action: string;
            details: string;
            reference: string;
            timestamp: Date;
        }[];
        pagination: {
            currentPage: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getAdminProfile(req: any): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        role: any;
        permissions: any;
    }>;
    getAllUsers(page?: number, limit?: number, role?: string, kycStatus?: string): Promise<{
        users: import("../entities").User[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto): Promise<import("../entities").User>;
    createAdminUser(createAdminUserDto: CreateAdminUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        role: import("../enums/user.enum").UserRole;
        isVerified: boolean;
        kycStatus: import("../enums/user.enum").KycStatus;
        isTwoFactorEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
        notifications: import("../entities").Notification[];
        otps: import("../entities").OTP[];
        paymentMethods: import("../entities").PaymentMethod[];
        receivedTransfers: import("../entities").Transfer[];
        sentTransfers: import("../entities").Transfer[];
        beneficiaries: import("../entities").Beneficiary[];
        profile: import("../entities").UserProfile;
    }>;
    updateKycStatus(userId: string, updateKycStatusDto: UpdateKycStatusDto): Promise<import("../entities").User>;
    deactivateUser(userId: string): Promise<{
        message: string;
        userId: string;
    }>;
    getAllTransfers(page?: number, limit?: number, status?: string): Promise<{
        transfers: {
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
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    updateTransferStatus(transferId: string, updateTransferStatusDto: UpdateTransferStatusDto): Promise<import("../entities").Transfer>;
    getAllExchangeRates(): Promise<import("../entities").ExchangeRate[]>;
    createExchangeRate(createExchangeRateDto: CreateExchangeRateDto): Promise<import("../entities").ExchangeRate>;
    updateExchangeRate(fromCurrency: string, toCurrency: string, data: {
        rate: number;
        buyRate?: number;
        sellRate?: number;
    }): Promise<import("../entities").ExchangeRate>;
    deactivateExchangeRate(fromCurrency: string, toCurrency: string): Promise<{
        message: string;
        fromCurrency: string;
        toCurrency: string;
    }>;
    refreshExchangeRates(): Promise<{
        message: string;
    }>;
    getAllFeeConfigurations(): Promise<import("../entities").Fee[]>;
    createFeeConfiguration(data: CreateFeeConfigurationDto): Promise<import("../entities").Fee>;
    updateFeeConfiguration(id: string, data: UpdateFeeConfigurationDto): Promise<import("../entities").Fee>;
    deleteFeeConfiguration(id: string): Promise<import("../entities").Fee>;
    getSystemSettings(): Promise<{
        key: string;
        value: string;
        description: string;
    }[]>;
    updateSystemSetting(key: string, data: {
        value: string;
    }): Promise<{
        key: string;
        value: string;
        updatedAt: Date;
    }>;
    createSystemSetting(data: {
        key: string;
        value: string;
        description?: string;
        type?: string;
    }): Promise<{
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        description?: string;
        type?: string;
        id: string;
    }>;
    requestVerificationOtp(requestDto: RequestAdminVerificationDto): Promise<{
        message: string;
        otpSent: boolean;
    }>;
    verifyOtp(verifyAdminOtpDto: VerifyAdminOtpDto): Promise<{
        message: string;
        verified: boolean;
    }>;
    private getPermissionsByRole;
}
