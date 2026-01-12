import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyOTPDto, ResetPasswordDto, ChangePasswordDto, RequestEmailVerificationDto, VerifyEmailDto, Verify2FADto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            role: import("../enums/user.enum").UserRole;
            isVerified: boolean;
            kycStatus: import("../enums/user.enum").KycStatus;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        email: string;
        twoFactorEnabled: boolean;
        user?: undefined;
        accessToken?: undefined;
    } | {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            role: import("../enums/user.enum").UserRole;
            isVerified: boolean;
            kycStatus: import("../enums/user.enum").KycStatus;
            createdAt: Date;
        };
        accessToken: string;
        message?: undefined;
        email?: undefined;
        twoFactorEnabled?: undefined;
    }>;
    verify2FA(verify2FADto: Verify2FADto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            role: import("../enums/user.enum").UserRole;
            isVerified: boolean;
            kycStatus: import("../enums/user.enum").KycStatus;
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
    requestEmailVerification(requestDto: RequestEmailVerificationDto): Promise<{
        message: string;
        otpSent: boolean;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
        verified: boolean;
    }>;
    getProfile(req: any): Promise<import("../entities").User>;
}
