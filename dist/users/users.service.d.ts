import { Repository } from 'typeorm';
import { User, UserProfile } from '../entities';
import { UpdateProfileDto } from './dto/users.dto';
export declare class UsersService {
    private userRepository;
    private userProfileRepository;
    constructor(userRepository: Repository<User>, userProfileRepository: Repository<UserProfile>);
    findById(id: string): Promise<User>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserProfile>;
    getProfile(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            isVerified: boolean;
            kycStatus: import("../enums/user.enum").KycStatus;
        };
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    getTransferHistory(userId: string, page?: number, limit?: number): Promise<{
        transfers: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
}
