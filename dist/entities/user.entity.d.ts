import { UserRole, KycStatus } from '../enums/user.enum';
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    role: UserRole;
    isVerified: boolean;
    kycStatus: KycStatus;
    createdAt: Date;
    updatedAt: Date;
    notifications: any[];
    otps: any[];
    paymentMethods: any[];
    receivedTransfers: any[];
    sentTransfers: any[];
    profile: any;
}
