import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyOTPDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
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
}
