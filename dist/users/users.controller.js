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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const users_dto_1 = require("./dto/users.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const email_service_1 = require("../common/services/email.service");
let UsersController = class UsersController {
    constructor(usersService, emailService) {
        this.usersService = usersService;
        this.emailService = emailService;
    }
    async getCurrentUser(req) {
        return this.usersService.findById(req.user.id);
    }
    async getProfile(req) {
        return this.usersService.getProfile(req.user.id);
    }
    async updateProfile(req, updateProfileDto) {
        return this.usersService.updateProfile(req.user.id, updateProfileDto);
    }
    async getTransferHistory(req, page, limit, status, type) {
        return this.usersService.getTransferHistory(req.user.id, page ? Number(page) : 1, limit ? Number(limit) : 10);
    }
    async testEmail(req, body) {
        if (process.env.NODE_ENV === 'production') {
            return { message: 'Test endpoints are disabled in production' };
        }
        const user = req.user;
        const { type } = body;
        try {
            let result;
            switch (type) {
                case 'welcome':
                    result = await this.emailService.sendWelcomeEmail(user.email, user.firstName);
                    break;
                case 'otp':
                    result = await this.emailService.sendPasswordResetOTP(user.email, '123456', user.firstName);
                    break;
                case 'transaction':
                    result = await this.emailService.sendTransactionNotification(user.email, user.firstName, {
                        type: 'completed',
                        amount: '100.00',
                        currency: 'USD',
                        recipient: 'John Doe',
                        reference: 'TXN123456789'
                    });
                    break;
                default:
                    return { success: false, message: 'Invalid email type' };
            }
            return {
                success: result,
                message: result ? 'Test email sent successfully via SendGrid' : 'Failed to send test email',
                emailType: type
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error sending test email',
                error: error.message
            };
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user basic information',
        description: 'Retrieve basic user account information for the authenticated user. This is a lightweight endpoint for user identification.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User information retrieved successfully',
        example: {
            id: 'user_123',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER',
            isActive: true,
            createdAt: '2024-11-14T10:00:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get complete user profile',
        description: 'Retrieve complete user profile including personal information, KYC status, verification details, and account settings.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile retrieved successfully',
        example: {
            id: 'user_123',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+2348123456789',
            dateOfBirth: '1990-01-15',
            address: '123 Lagos Street',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            isEmailVerified: true,
            isPhoneVerified: true,
            kycStatus: 'APPROVED',
            profileCompleteness: 95,
            lastLoginAt: '2024-11-14T12:30:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Profile not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user profile information',
        description: 'Update user profile details including personal information and address. Some fields may require KYC re-verification if changed.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Profile updated successfully',
        example: {
            message: 'Profile updated successfully',
            updated: true,
            kycReviewRequired: false
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid profile data or validation errors' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('transfers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user transfer history with pagination',
        description: 'Retrieve paginated transfer history for the authenticated user including both sent and received transfers with detailed status information.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transfer history retrieved successfully',
        example: {
            transfers: [
                {
                    id: 'transfer_123',
                    reference: 'WAY123456ABC',
                    amount: 100.00,
                    fee: 2.50,
                    status: 'COMPLETED',
                    type: 'SENT',
                    recipientName: 'Jane Doe',
                    createdAt: '2024-11-14T10:00:00Z'
                }
            ],
            pagination: {
                currentPage: 1,
                totalPages: 3,
                totalItems: 25,
                itemsPerPage: 10
            }
        }
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of transfers per page (default: 10, max: 50)' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
        description: 'Filter transfers by status (optional)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: ['SENT', 'RECEIVED'],
        description: 'Filter by transfer type (optional)'
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getTransferHistory", null);
__decorate([
    (0, common_1.Post)('test-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Test SendGrid email functionality (Development only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test email sent successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "testEmail", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        email_service_1.EmailService])
], UsersController);
//# sourceMappingURL=users.controller.js.map