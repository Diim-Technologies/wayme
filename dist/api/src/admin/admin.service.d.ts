import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserRoleDto, AdminStatsDto } from './dto/admin.dto';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
export declare class AdminService {
    private prisma;
    private currencyService;
    private feeService;
    constructor(prisma: PrismaService, currencyService: CurrencyService, feeService: FeeService);
    getDashboardStats(): Promise<AdminStatsDto>;
    getAllUsers(page?: number, limit?: number, role?: string, kycStatus?: string): Promise<{
        users: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
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
    getAllTransfers(page?: number, limit?: number, status?: string): Promise<{
        transfers: ({
            transactions: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.TransactionType;
                status: import(".prisma/client").$Enums.TransactionStatus;
                amount: import("@prisma/client/runtime/library").Decimal;
                reference: string;
                processedAt: Date | null;
                transferId: string;
                currency: string;
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
            sender: {
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransferStatus;
            senderId: string;
            receiverId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            fee: import("@prisma/client/runtime/library").Decimal;
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            sourceCurrency: string;
            targetCurrency: string;
            purpose: string;
            reference: string;
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
    updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    updateKycStatus(userId: string, kycStatus: string, reason?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
    updateTransferStatus(transferId: string, status: string, reason?: string): Promise<{
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
        sender: {
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TransferStatus;
        senderId: string;
        receiverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        fee: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        reference: string;
        paymentMethodId: string;
        recipientBankId: string | null;
        recipientAccount: string | null;
        recipientName: string | null;
        recipientPhone: string | null;
        notes: string | null;
        processedAt: Date | null;
        completedAt: Date | null;
    }>;
    deactivateUser(userId: string): Promise<{
        message: string;
        userId: string;
    }>;
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
    getAllExchangeRates(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
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
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
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
        fromCurrency: string;
        toCurrency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
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
        currency: string;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        minimumFee: import("@prisma/client/runtime/library").Decimal | null;
        maximumFee: import("@prisma/client/runtime/library").Decimal | null;
        applicableTo: string | null;
    }[]>;
    createFeeConfiguration(data: {
        name: string;
        type: string;
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
        currency: string;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        minimumFee: import("@prisma/client/runtime/library").Decimal | null;
        maximumFee: import("@prisma/client/runtime/library").Decimal | null;
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
        currency: string;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        minimumFee: import("@prisma/client/runtime/library").Decimal | null;
        maximumFee: import("@prisma/client/runtime/library").Decimal | null;
        applicableTo: string | null;
    }>;
    deleteFeeConfiguration(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.FeeType;
        currency: string;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        minimumFee: import("@prisma/client/runtime/library").Decimal | null;
        maximumFee: import("@prisma/client/runtime/library").Decimal | null;
        applicableTo: string | null;
    }>;
    getSystemSettings(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        key: string;
        value: string;
    }[]>;
    updateSystemSetting(key: string, value: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        key: string;
        value: string;
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
        key: string;
        value: string;
    }>;
}
