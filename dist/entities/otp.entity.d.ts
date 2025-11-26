import { OTPType } from '../enums/common.enum';
import { User } from './user.entity';
export declare class OTP {
    id: string;
    userId: string;
    code: string;
    type: OTPType;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    user: User;
}
