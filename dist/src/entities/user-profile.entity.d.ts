import { User } from './user.entity';
export declare class UserProfile {
    id: string;
    userId: string;
    dateOfBirth: Date;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    occupation: string;
    idType: string;
    idNumber: string;
    idImageUrl: string;
    selfieUrl: string;
    kycSubmittedAt: Date;
    kycReviewedAt: Date;
    kycReviewedBy: string;
    kycRejectionReason: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
