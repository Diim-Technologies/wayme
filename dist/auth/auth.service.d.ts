import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, OTP } from '../entities';
import { EmailService } from '../common/services/email.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, VerifyOTPDto, ResetPasswordDto, ChangePasswordDto, RequestEmailVerificationDto, VerifyEmailDto } from './dto/auth.dto';
export declare class AuthService {
    private userRepository;
    private otpRepository;
    private dataSource;
    private jwtService;
    private emailService;
    constructor(userRepository: Repository<User>, otpRepository: Repository<OTP>, dataSource: DataSource, jwtService: JwtService, emailService: EmailService);
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
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    validateUser(userId: string): Promise<User>;
    private generateOTP;
    requestEmailVerificationOTP(requestDto: RequestEmailVerificationDto): Promise<{
        message: string;
        otpSent: boolean;
    }>;
    verifyEmailOTP(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
        verified: boolean;
    }>;
    cleanupExpiredOTPs(): Promise<void>;
}
