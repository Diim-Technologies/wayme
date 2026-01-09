import { User } from './user.entity';
export declare class Beneficiary {
    id: string;
    generateId(): void;
    userId: string;
    name: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
    email: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
