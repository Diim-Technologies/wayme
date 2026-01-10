export declare class UpdateUserRoleDto {
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}
export declare class UpdateKycStatusDto {
    kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    reason?: string;
}
export declare class UpdateTransferStatusDto {
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
    reason?: string;
}
export declare class AdminStatsDto {
    totalUsers: number;
    totalTransfers: number;
    totalRevenue: number;
    pendingTransfers: number;
    completedTransfers: number;
    failedTransfers: number;
    pendingKyc: number;
}
export declare class CreateExchangeRateDto {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    buyRate?: number;
    sellRate?: number;
}
export declare class CreateAdminUserDto {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
}
import { FeeType } from '../../enums/common.enum';
export declare class CreateFeeConfigurationDto {
    name: string;
    type: FeeType;
    percentage?: number;
    fixedAmount?: number;
    currency?: string;
    applicableTo?: string[];
}
export declare class UpdateFeeConfigurationDto {
    percentage?: number;
    fixedAmount?: number;
    applicableTo?: string[];
    isActive?: boolean;
}
export declare class RequestAdminVerificationDto {
    email: string;
}
export declare class VerifyAdminOtpDto {
    email: string;
    code: string;
}
