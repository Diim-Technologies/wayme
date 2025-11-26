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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }
    async verifyOTP(verifyOTPDto) {
        return this.authService.verifyOTP(verifyOTPDto);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    async changePassword(req, changePasswordDto) {
        return this.authService.changePassword(req.user.id, changePasswordDto);
    }
    async getProfile(req) {
        return this.authService.validateUser(req.user.id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: 'Register a new user account',
        description: 'Create a new user account with email verification. Users must verify their email before they can make transfers.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User registered successfully',
        example: {
            id: 'user_123',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isEmailVerified: false,
            kycStatus: 'PENDING',
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or phone number already registered' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid registration data or weak password' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'Login with email and password',
        description: 'Authenticate user with email/password and return JWT token for accessing protected endpoints.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        example: {
            user: {
                id: 'user_123',
                email: 'john@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER',
                isEmailVerified: true,
                kycStatus: 'APPROVED'
            },
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            tokenType: 'Bearer',
            expiresIn: 3600
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid email or password' }),
    (0, swagger_1.ApiResponse)({ status: 423, description: 'Account is locked or suspended' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({
        summary: 'Request password reset OTP via email',
        description: 'Send a password reset OTP to the user\'s email address. OTP expires after 10 minutes. For security, this endpoint always returns success even if email doesn\'t exist.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password reset OTP sent to email if account exists',
        example: {
            message: 'If an account with this email exists, you will receive a password reset code shortly.',
            otpSent: true
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid email format' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify password reset OTP',
        description: 'Verify the OTP sent to the user\'s email for password reset. Returns a temporary token for password reset.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP verified successfully',
        example: {
            message: 'OTP verified successfully',
            resetToken: 'temp_reset_token_xyz123',
            expiresIn: 600
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid, expired, or already used OTP' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found or OTP not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyOTPDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOTP", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset password using verified OTP',
        description: 'Reset the user password using the OTP and temporary reset token from the verify-otp endpoint.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password reset successfully',
        example: {
            message: 'Password reset successfully',
            passwordChanged: true
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired reset token, or weak password' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Change password for authenticated users',
        description: 'Change password for logged-in users. Requires current password for security verification.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password changed successfully',
        example: {
            message: 'Password changed successfully',
            passwordChanged: true
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Current password is incorrect or new password is weak' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current authenticated user profile',
        description: 'Retrieve the profile information for the currently logged-in user including KYC status and email verification status.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
        example: {
            id: 'user_123',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+2348123456789',
            role: 'USER',
            isEmailVerified: true,
            kycStatus: 'APPROVED',
            createdAt: '2024-11-14T10:00:00Z',
            lastLoginAt: '2024-11-14T12:30:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map