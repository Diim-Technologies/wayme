import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/services/email.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyOTPDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            createdAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            role: import(".prisma/client").$Enums.UserRole;
            isVerified: boolean;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
        };
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            role: import(".prisma/client").$Enums.UserRole;
            isVerified: boolean;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyOTP(verifyOTPDto: VerifyOTPDto): Promise<{
        message: string;
        verified: boolean;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        role: import(".prisma/client").$Enums.UserRole;
        isVerified: boolean;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
    private generateOTP;
    cleanupExpiredOTPs(): Promise<void>;
}
