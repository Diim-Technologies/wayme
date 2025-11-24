import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/users.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getCurrentUser(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        isVerified: boolean;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        profile: {
            id: string;
            country: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            dateOfBirth: Date | null;
            address: string | null;
            city: string | null;
            state: string | null;
            postalCode: string | null;
            occupation: string | null;
            idType: string | null;
            idNumber: string | null;
            idImageUrl: string | null;
            selfieUrl: string | null;
        };
    }>;
    getProfile(req: any): Promise<{
        user: {
            id: string;
            email: string;
            phoneNumber: string;
            firstName: string;
            lastName: string;
            isVerified: boolean;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
        };
    } & {
        id: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        dateOfBirth: Date | null;
        address: string | null;
        city: string | null;
        state: string | null;
        postalCode: string | null;
        occupation: string | null;
        idType: string | null;
        idNumber: string | null;
        idImageUrl: string | null;
        selfieUrl: string | null;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
        id: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        dateOfBirth: Date | null;
        address: string | null;
        city: string | null;
        state: string | null;
        postalCode: string | null;
        occupation: string | null;
        idType: string | null;
        idNumber: string | null;
        idImageUrl: string | null;
        selfieUrl: string | null;
    }>;
    getTransferHistory(req: any, page?: number, limit?: number, status?: string, type?: string): Promise<{
        transfers: ({
            sender: {
                email: string;
                firstName: string;
                lastName: string;
            };
            receiver: {
                email: string;
                firstName: string;
                lastName: string;
            };
            recipientBank: {
                id: string;
                code: string;
                name: string;
                country: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            reference: string;
            senderId: string;
            receiverId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            fee: import("@prisma/client/runtime/library").Decimal;
            sourceCurrency: string;
            targetCurrency: string;
            purpose: string;
            status: import(".prisma/client").$Enums.TransferStatus;
            paymentMethodId: string;
            recipientBankId: string | null;
            recipientAccount: string | null;
            recipientName: string | null;
            recipientPhone: string | null;
            notes: string | null;
            processedAt: Date | null;
            completedAt: Date | null;
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
}
