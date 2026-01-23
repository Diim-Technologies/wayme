"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const entities_1 = require("../entities");
const common_enum_1 = require("../enums/common.enum");
const email_service_1 = require("../common/services/email.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(userRepository, otpRepository, dataSource, jwtService, emailService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.dataSource = dataSource;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async register(registerDto) {
        const { email, firstName, lastName, phoneNumber, password } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { phoneNumber }],
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('Email already registered');
            }
            throw new common_1.ConflictException('Phone number already registered');
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = this.userRepository.create({
            email,
            firstName,
            lastName,
            phoneNumber,
            password: hashedPassword,
        });
        const savedUser = await this.userRepository.save(user);
        const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
        const accessToken = this.jwtService.sign(payload);
        try {
            await this.emailService.sendWelcomeEmail(email, firstName);
        }
        catch (error) {
            console.log('Failed to send welcome email:', error);
        }
        return {
            user: {
                id: savedUser.id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                phoneNumber: savedUser.phoneNumber,
                role: savedUser.role,
                isVerified: savedUser.isVerified,
                kycStatus: savedUser.kycStatus,
                createdAt: savedUser.createdAt,
            },
            accessToken,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.isTwoFactorEnabled) {
            const otp = this.generateOTP();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const otpEntity = this.otpRepository.create({
                userId: user.id,
                code: otp,
                type: common_enum_1.OTPType.TWO_FACTOR_AUTH,
                expiresAt,
            });
            await this.otpRepository.save(otpEntity);
            try {
                await this.emailService.sendLogin2FAOTP(email, otp, user.firstName);
            }
            catch (error) {
                console.log('Failed to send 2FA OTP:', error);
            }
            return {
                message: '2FA_REQUIRED',
                email: user.email,
                twoFactorEnabled: true,
            };
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                role: user.role,
                isVerified: user.isVerified,
                kycStatus: user.kycStatus,
                createdAt: user.createdAt,
            },
            accessToken,
        };
    }
    async verify2FA(verify2FADto) {
        const { email, code } = verify2FADto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otp = await this.otpRepository.findOne({
            where: {
                userId: user.id,
                code,
                type: common_enum_1.OTPType.TWO_FACTOR_AUTH,
                isUsed: false,
            },
        });
        if (!otp || otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired 2FA code');
        }
        await this.otpRepository.update({ id: otp.id }, { isUsed: true });
        if (user.isEmailVerified != true) {
            await this.userRepository.update({ id: user.id }, { isEmailVerified: true });
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                role: user.role,
                isVerified: user.isVerified,
                kycStatus: user.kycStatus,
                createdAt: user.createdAt,
            },
            accessToken,
        };
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            return {
                message: 'If the email exists in our system, you will receive a password reset code.',
            };
        }
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpEntity = this.otpRepository.create({
            userId: user.id,
            code: otp,
            type: common_enum_1.OTPType.PASSWORD_RESET,
            expiresAt,
        });
        await this.otpRepository.save(otpEntity);
        try {
            await this.emailService.sendPasswordResetOTP(email, otp, user.firstName);
        }
        catch (error) {
            console.log('Failed to send password reset OTP:', error);
            throw new common_1.BadRequestException('Failed to send password reset email. Please try again.');
        }
        return {
            message: 'If the email exists in our system, you will receive a password reset code.',
        };
    }
    async verifyOTP(verifyOTPDto) {
        const { email, code } = verifyOTPDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otp = await this.otpRepository.findOne({
            where: {
                userId: user.id,
                code,
                type: common_enum_1.OTPType.PASSWORD_RESET,
                isUsed: false,
            },
        });
        if (!otp || otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP code');
        }
        return {
            message: 'OTP verified successfully. You can now reset your password.',
            verified: true,
        };
    }
    async resetPassword(resetPasswordDto) {
        const { email, code, newPassword } = resetPasswordDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otp = await this.otpRepository.findOne({
            where: {
                userId: user.id,
                code,
                type: common_enum_1.OTPType.PASSWORD_RESET,
                isUsed: false,
            },
        });
        if (!otp || otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP code');
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.User, { id: user.id }, { password: hashedPassword });
            await manager.update(entities_1.OTP, { id: otp.id }, { isUsed: true });
        });
        try {
            await this.emailService.sendPasswordChangeConfirmation(email, user.firstName);
        }
        catch (error) {
            console.log('Failed to send password change confirmation:', error);
        }
        return {
            message: 'Password reset successfully. You can now login with your new password.',
        };
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new common_1.BadRequestException('New password must be different from current password');
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await this.userRepository.update({ id: userId }, { password: hashedPassword });
        try {
            await this.emailService.sendPasswordChangeConfirmation(user.email, user.firstName);
        }
        catch (error) {
            console.log('Failed to send password change confirmation:', error);
        }
        return {
            message: 'Password changed successfully.',
        };
    }
    async validateUser(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                role: true,
                isVerified: true,
                isEmailVerified: true,
                kycStatus: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async requestEmailVerificationOTP(requestDto) {
        const { email } = requestDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpEntity = this.otpRepository.create({
            userId: user.id,
            code: otp,
            type: common_enum_1.OTPType.EMAIL_VERIFICATION,
            expiresAt,
        });
        await this.otpRepository.save(otpEntity);
        try {
            await this.emailService.sendEmailVerificationOTP(email, otp, user.firstName);
        }
        catch (error) {
            console.log('Failed to send email verification OTP:', error);
            throw new common_1.BadRequestException('Failed to send verification email. Please try again.');
        }
        return {
            message: 'Verification code sent to your email address.',
            otpSent: true,
        };
    }
    async verifyEmailOTP(verifyEmailDto) {
        const { email, code } = verifyEmailDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        const otp = await this.otpRepository.findOne({
            where: {
                userId: user.id,
                code,
                type: common_enum_1.OTPType.EMAIL_VERIFICATION,
                isUsed: false,
            },
        });
        if (!otp || otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired verification code');
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.User, { id: user.id }, { isVerified: true, isEmailVerified: true });
            await manager.update(entities_1.OTP, { id: otp.id }, { isUsed: true });
        });
        return {
            message: 'Email verified successfully.',
            verified: true,
        };
    }
    async cleanupExpiredOTPs() {
        await this.otpRepository
            .createQueryBuilder()
            .delete()
            .where('expiresAt < :now', { now: new Date() })
            .execute();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.OTP)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map