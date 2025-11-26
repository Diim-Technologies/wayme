import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/users.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getCurrentUser(req: any): Promise<import("../entities").User>;
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<import("../entities").UserProfile>;
    getTransferHistory(req: any, page?: number, limit?: number, status?: string, type?: string): Promise<{
        transfers: any[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
}
