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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../common/services/email.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async register(registerDto) {
        const { email, firstName, lastName, phoneNumber, password } = registerDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { phoneNumber }],
            },
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('Email already registered');
            }
            throw new common_1.ConflictException('Phone number already registered');
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await this.prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                phoneNumber,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                role: true,
                isVerified: true,
                kycStatus: true,
                createdAt: true,
            },
        });
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        try {
            await this.emailService.sendWelcomeEmail(email, firstName);
        }
        catch (error) {
            console.log('Failed to send welcome email:', error);
        }
        return {
            user,
            accessToken,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
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
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                message: 'If the email exists in our system, you will receive a password reset code.',
            };
        }
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.oTP.create({
            data: {
                userId: user.id,
                code: otp,
                type: 'PASSWORD_RESET',
                expiresAt,
            },
        });
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
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otp = await this.prisma.oTP.findFirst({
            where: {
                userId: user.id,
                code,
                type: 'PASSWORD_RESET',
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('Invalid or expired OTP code');
        }
        return {
            message: 'OTP verified successfully. You can now reset your password.',
            verified: true,
        };
    }
    async resetPassword(resetPasswordDto) {
        const { email, code, newPassword } = resetPasswordDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const otp = await this.prisma.oTP.findFirst({
            where: {
                userId: user.id,
                code,
                type: 'PASSWORD_RESET',
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('Invalid or expired OTP code');
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            }),
            this.prisma.oTP.update({
                where: { id: otp.id },
                data: { isUsed: true },
            }),
        ]);
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
        const user = await this.prisma.user.findUnique({
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
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
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
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                role: true,
                isVerified: true,
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
    async cleanupExpiredOTPs() {
        await this.prisma.oTP.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map