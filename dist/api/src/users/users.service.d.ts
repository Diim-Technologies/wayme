import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/users.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
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
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
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
    getProfile(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
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
    getTransferHistory(userId: string, page?: number, limit?: number): Promise<{
        transfers: ({
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
            sender: {
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransferStatus;
            senderId: string;
            receiverId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            fee: import("@prisma/client/runtime/library").Decimal;
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            sourceCurrency: string;
            targetCurrency: string;
            purpose: string;
            reference: string;
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
