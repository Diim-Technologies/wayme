import { UserRole, KycStatus } from '../enums/user.enum';
import { Notification } from './notification.entity';
import { OTP } from './otp.entity';
import { PaymentMethod } from './payment-method.entity';
import { Transfer } from './transfer.entity';
import { Beneficiary } from './beneficiary.entity';
import { UserProfile } from './user-profile.entity';
export declare class User {
    id: string;
    generateId(): void;
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
    notifications: Notification[];
    otps: OTP[];
    paymentMethods: PaymentMethod[];
    receivedTransfers: Transfer[];
    sentTransfers: Transfer[];
    beneficiaries: Beneficiary[];
    profile: UserProfile;
}
