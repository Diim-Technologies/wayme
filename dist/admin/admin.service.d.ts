import { Repository, DataSource } from 'typeorm';
import { User, Transfer, Transaction, PaymentMethod, Bank, Fee, Currency, Notification } from '../entities';
import { UserRole, KycStatus } from '../enums/user.enum';
import { UpdateUserRoleDto, AdminStatsDto, CreateAdminUserDto } from './dto/admin.dto';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
export declare class AdminService {
    private userRepository;
    private transferRepository;
    private transactionRepository;
    private paymentMethodRepository;
    private bankRepository;
    private feeRepository;
    private currencyRepository;
    private notificationRepository;
    private dataSource;
    private currencyService;
    private feeService;
    constructor(userRepository: Repository<User>, transferRepository: Repository<Transfer>, transactionRepository: Repository<Transaction>, paymentMethodRepository: Repository<PaymentMethod>, bankRepository: Repository<Bank>, feeRepository: Repository<Fee>, currencyRepository: Repository<Currency>, notificationRepository: Repository<Notification>, dataSource: DataSource, currencyService: CurrencyService, feeService: FeeService);
    getDashboardStats(): Promise<AdminStatsDto>;
    getAllUsers(page?: number, limit?: number, role?: string, kycStatus?: string): Promise<{
        users: User[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getAllTransfers(page?: number, limit?: number, status?: string): Promise<{
        transfers: Transfer[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto): Promise<User>;
    createAdminUser(createAdminUserDto: CreateAdminUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        role: UserRole;
        isVerified: boolean;
        kycStatus: KycStatus;
        createdAt: Date;
        updatedAt: Date;
        notifications: Notification[];
        otps: import("../entities").OTP[];
        paymentMethods: PaymentMethod[];
        receivedTransfers: Transfer[];
        sentTransfers: Transfer[];
        beneficiaries: import("../entities").Beneficiary[];
        profile: import("../entities").UserProfile;
    }>;
    updateKycStatus(userId: string, kycStatus: string, reason?: string): Promise<User>;
    updateTransferStatus(transferId: string, status: string, reason?: string): Promise<Transfer>;
    approveTransfer(transferId: string): Promise<Transfer>;
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
    getAllExchangeRates(): Promise<import("../entities").ExchangeRate[]>;
    updateExchangeRate(fromCurrency: string, toCurrency: string, data: {
        rate: number;
        buyRate?: number;
        sellRate?: number;
    }): Promise<import("../entities").ExchangeRate>;
    refreshExchangeRates(): Promise<{
        message: string;
    }>;
    deactivateExchangeRate(fromCurrency: string, toCurrency: string): Promise<{
        message: string;
        fromCurrency: string;
        toCurrency: string;
    }>;
    getAllFeeConfigurations(): Promise<Fee[]>;
    createFeeConfiguration(data: {
        name: string;
        type: string;
        percentage?: number;
        fixedAmount?: number;
        minimumFee?: number;
        maximumFee?: number;
        currency?: string;
        applicableTo?: string[];
    }): Promise<Fee>;
    updateFeeConfiguration(id: string, data: {
        percentage?: number;
        fixedAmount?: number;
        minimumFee?: number;
        maximumFee?: number;
        applicableTo?: string[];
        isActive?: boolean;
    }): Promise<Fee>;
    deleteFeeConfiguration(id: string): Promise<Fee>;
    getSystemSettings(): Promise<{
        key: string;
        value: string;
        description: string;
    }[]>;
    updateSystemSetting(key: string, value: string): Promise<{
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
}
