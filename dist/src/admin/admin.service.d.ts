import { Repository, DataSource } from 'typeorm';
import { User, Transfer, Transaction, PaymentMethod, Bank, Fee, Currency, Notification, OTP } from '../entities';
import { UserRole, KycStatus } from '../enums/user.enum';
import { TransferStatus } from '../enums/common.enum';
import { UpdateUserRoleDto, AdminStatsDto, CreateAdminUserDto, CreateFeeConfigurationDto, UpdateFeeConfigurationDto, RequestAdminVerificationDto, VerifyAdminOtpDto } from './dto/admin.dto';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
import { EmailService } from '../common/services/email.service';
export declare class AdminService {
    private userRepository;
    private transferRepository;
    private transactionRepository;
    private paymentMethodRepository;
    private bankRepository;
    private feeRepository;
    private currencyRepository;
    private notificationRepository;
    private otpRepository;
    private dataSource;
    private currencyService;
    private feeService;
    private emailService;
    constructor(userRepository: Repository<User>, transferRepository: Repository<Transfer>, transactionRepository: Repository<Transaction>, paymentMethodRepository: Repository<PaymentMethod>, bankRepository: Repository<Bank>, feeRepository: Repository<Fee>, currencyRepository: Repository<Currency>, notificationRepository: Repository<Notification>, otpRepository: Repository<OTP>, dataSource: DataSource, currencyService: CurrencyService, feeService: FeeService, emailService: EmailService);
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
            status: TransferStatus;
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
            transactions: Transaction[];
            paymentMethod: PaymentMethod;
            receiver: User;
            recipientBank: Bank;
            sender: User;
            disputes: import("../entities").Dispute[];
        }[];
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
        isEmailVerified: boolean;
        kycStatus: KycStatus;
        isTwoFactorEnabled: boolean;
        createdAt: Date;
        updatedAt: Date;
        notifications: Notification[];
        otps: OTP[];
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
    createFeeConfiguration(data: CreateFeeConfigurationDto): Promise<Fee>;
    updateFeeConfiguration(id: string, data: UpdateFeeConfigurationDto): Promise<Fee>;
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
    requestAdminVerificationOTP(requestDto: RequestAdminVerificationDto): Promise<{
        message: string;
        otpSent: boolean;
    }>;
    verifyAdminOTP(verifyAdminOtpDto: VerifyAdminOtpDto): Promise<{
        message: string;
        verified: boolean;
    }>;
    private generateOTP;
}
