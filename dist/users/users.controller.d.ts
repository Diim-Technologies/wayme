import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/users.dto';
import { EmailService } from '../common/services/email.service';
export declare class UsersController {
    private usersService;
    private readonly emailService;
    constructor(usersService: UsersService, emailService: EmailService);
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
        transfers: {
            type: string;
            id: string;
            senderId: string;
            receiverId: string;
            amount: number;
            fee: number;
            exchangeRate: number;
            sourceCurrency: string;
            targetCurrency: string;
            purpose: string;
            status: import("../enums/common.enum").TransferStatus;
            reference: string;
            paymentMethodId: string;
            recipientBankId: string;
            recipientAccount: string;
            recipientName: string;
            recipientPhone: string;
            notes: string;
            processedAt: Date;
            completedAt: Date;
            createdAt: Date;
            updatedAt: Date;
            transactions: import("../entities").Transaction[];
            paymentMethod: import("../entities").PaymentMethod;
            receiver: import("../entities").User;
            recipientBank: import("../entities").Bank;
            sender: import("../entities").User;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    testEmail(req: any, body: {
        type: 'welcome' | 'otp' | 'transaction';
    }): Promise<{
        message: string;
        success?: undefined;
        emailType?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        emailType?: undefined;
        error?: undefined;
    } | {
        success: any;
        message: string;
        emailType: "welcome" | "otp" | "transaction";
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        emailType?: undefined;
    }>;
}
