import { AdminService } from './admin.service';
import { UpdateUserRoleDto, UpdateKycStatusDto, UpdateTransferStatusDto, CreateExchangeRateDto } from './dto/admin.dto';
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
    updateKycStatus(userId: string, updateKycStatusDto: UpdateKycStatusDto): Promise<import("../entities").User>;
    deactivateUser(userId: string): Promise<{
        message: string;
        userId: string;
    }>;
    getAllTransfers(page?: number, limit?: number, status?: string): Promise<{
        transfers: import("../entities").Transfer[];
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
    createFeeConfiguration(data: {
        name: string;
        type: 'TRANSFER_FEE' | 'CURRENCY_CONVERSION_FEE' | 'WITHDRAWAL_FEE' | 'CARD_PROCESSING_FEE';
        percentage?: number;
        fixedAmount?: number;
        minimumFee?: number;
        maximumFee?: number;
        currency?: string;
        applicableTo?: string[];
    }): Promise<import("../entities").Fee>;
    updateFeeConfiguration(id: string, data: {
        percentage?: number;
        fixedAmount?: number;
        minimumFee?: number;
        maximumFee?: number;
        applicableTo?: string[];
        isActive?: boolean;
    }): Promise<import("../entities").Fee>;
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
    private getPermissionsByRole;
}
