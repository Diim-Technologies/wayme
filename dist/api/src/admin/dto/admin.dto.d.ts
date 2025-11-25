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
