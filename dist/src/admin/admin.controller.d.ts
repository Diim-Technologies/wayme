import { AdminService } from './admin.service';
import { UpdateUserRoleDto, UpdateKycStatusDto, UpdateTransferStatusDto } from './dto/admin.dto';
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
        users: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phoneNumber: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            isVerified: boolean;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            profile: {
                id: string;
                country: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                dateOfBirth: Date | null;
                address: string | null;
                city: string | null;
                state: string | null;
                postalCode: string | null;
                occupation: string | null;
                idType: string | null;
                idNumber: string | null;
                idImageUrl: string | null;
                selfieUrl: string | null;
            };
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    updateKycStatus(userId: string, updateKycStatusDto: UpdateKycStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
    deactivateUser(userId: string): Promise<{
        message: string;
        userId: string;
    }>;
    getAllTransfers(page?: number, limit?: number, status?: string): Promise<{
        transfers: ({
            sender: {
                email: string;
                firstName: string;
                lastName: string;
            };
            transactions: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.TransactionType;
                currency: string;
                transferId: string;
                reference: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: import(".prisma/client").$Enums.TransactionStatus;
                processedAt: Date | null;
                gatewayRef: string | null;
                gatewayData: import("@prisma/client/runtime/library").JsonValue | null;
                failureReason: string | null;
            }[];
            receiver: {
                email: string;
                firstName: string;
                lastName: string;
            };
            recipientBank: {
                id: string;
                code: string;
                name: string;
                country: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            reference: string;
            senderId: string;
            receiverId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            fee: import("@prisma/client/runtime/library").Decimal;
            sourceCurrency: string;
            targetCurrency: string;
            purpose: string;
            status: import(".prisma/client").$Enums.TransferStatus;
            paymentMethodId: string;
            recipientBankId: string | null;
            recipientAccount: string | null;
            recipientName: string | null;
            recipientPhone: string | null;
            notes: string | null;
            processedAt: Date | null;
            completedAt: Date | null;
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    updateTransferStatus(transferId: string, updateTransferStatusDto: UpdateTransferStatusDto): Promise<{
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
        receiver: {
            email: string;
            firstName: string;
            lastName: string;
        };
        recipientBank: {
            id: string;
            code: string;
            name: string;
            country: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        reference: string;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        status: import(".prisma/client").$Enums.TransferStatus;
        paymentMethodId: string;
        recipientBankId: string | null;
        recipientAccount: string | null;
        recipientName: string | null;
        recipientPhone: string | null;
        notes: string | null;
        processedAt: Date | null;
        completedAt: Date | null;
    }>;
    getAllExchangeRates(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        fromCurrency: string;
        buyRate: import("@prisma/client/runtime/library").Decimal | null;
        sellRate: import("@prisma/client/runtime/library").Decimal | null;
        source: string;
        lastUpdated: Date;
    }[]>;
    updateExchangeRate(fromCurrency: string, toCurrency: string, data: {
        rate: number;
        buyRate?: number;
        sellRate?: number;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        fromCurrency: string;
        buyRate: import("@prisma/client/runtime/library").Decimal | null;
        sellRate: import("@prisma/client/runtime/library").Decimal | null;
        source: string;
        lastUpdated: Date;
    }>;
    deactivateExchangeRate(fromCurrency: string, toCurrency: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        fromCurrency: string;
        buyRate: import("@prisma/client/runtime/library").Decimal | null;
        sellRate: import("@prisma/client/runtime/library").Decimal | null;
        source: string;
        lastUpdated: Date;
    }>;
    refreshExchangeRates(): Promise<{
        message: string;
    }>;
    getAllFeeConfigurations(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.FeeType;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        minimumFee: import("@prisma/client/runtime/library").Decimal | null;
        maximumFee: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        applicableTo: string | null;
    }[]>;
    createFeeConfiguration(data: {
        name: string;
        type: 'TRANSFER_FEE' | 'CURRENCY_CONVERSION_FEE' | 'WITHDRAWAL_FEE' | 'CARD_PROCESSING_FEE';
        percentage?: number;
        fixedAmount?: number;
        minimumFee?: number;
        maximumFee?: number;
        currency?: string;
        applicableTo?: string[];
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.FeeType;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        minimumFee: import("@prisma/client/runtime/library").Decimal | null;
        maximumFee: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        applicableTo: string | null;
    }>;
    updateFeeConfiguration(id: string, data: {
        percentage?: number;
        fixedAmount?: number;
        minimumFee?: number;
        maximumFee?: number;
        applicableTo?: string[];
        isActive?: boolean;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.FeeType;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        minimumFee: import("@prisma/client/runtime/library").Decimal | null;
        maximumFee: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        applicableTo: string | null;
    }>;
    deleteFeeConfiguration(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.FeeType;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        minimumFee: import("@prisma/client/runtime/library").Decimal | null;
        maximumFee: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        applicableTo: string | null;
    }>;
    getSystemSettings(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        value: string;
        key: string;
    }[]>;
    updateSystemSetting(key: string, data: {
        value: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        value: string;
        key: string;
    }>;
    createSystemSetting(data: {
        key: string;
        value: string;
        description?: string;
        type?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        value: string;
        key: string;
    }>;
    private getPermissionsByRole;
}
