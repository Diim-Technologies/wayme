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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const admin_dto_1 = require("./dto/admin.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    async getSystemLogs(page, limit) {
        return this.adminService.getSystemLogs(page ? Number(page) : 1, limit ? Number(limit) : 50);
    }
    async getAdminProfile(req) {
        return {
            id: req.user.id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            role: req.user.role,
            permissions: this.getPermissionsByRole(req.user.role),
        };
    }
    async getAllUsers(page, limit, role, kycStatus) {
        return this.adminService.getAllUsers(page ? Number(page) : 1, limit ? Number(limit) : 20, role, kycStatus);
    }
    async updateUserRole(userId, updateUserRoleDto) {
        return this.adminService.updateUserRole(userId, updateUserRoleDto);
    }
    async createAdminUser(createAdminUserDto) {
        return this.adminService.createAdminUser(createAdminUserDto);
    }
    async updateKycStatus(userId, updateKycStatusDto) {
        return this.adminService.updateKycStatus(userId, updateKycStatusDto.kycStatus, updateKycStatusDto.reason);
    }
    async deactivateUser(userId) {
        return this.adminService.deactivateUser(userId);
    }
    async getAllTransfers(page, limit, status) {
        return this.adminService.getAllTransfers(page ? Number(page) : 1, limit ? Number(limit) : 20, status);
    }
    async updateTransferStatus(transferId, updateTransferStatusDto) {
        return this.adminService.updateTransferStatus(transferId, updateTransferStatusDto.status, updateTransferStatusDto.reason);
    }
    async getAllExchangeRates() {
        return this.adminService.getAllExchangeRates();
    }
    async createExchangeRate(createExchangeRateDto) {
        return this.adminService.updateExchangeRate(createExchangeRateDto.fromCurrency, createExchangeRateDto.toCurrency, {
            rate: createExchangeRateDto.rate,
            buyRate: createExchangeRateDto.buyRate,
            sellRate: createExchangeRateDto.sellRate,
        });
    }
    async updateExchangeRate(fromCurrency, toCurrency, data) {
        return this.adminService.updateExchangeRate(fromCurrency, toCurrency, data);
    }
    async deactivateExchangeRate(fromCurrency, toCurrency) {
        return this.adminService.deactivateExchangeRate(fromCurrency, toCurrency);
    }
    async refreshExchangeRates() {
        return this.adminService.refreshExchangeRates();
    }
    async getAllFeeConfigurations() {
        return this.adminService.getAllFeeConfigurations();
    }
    async createFeeConfiguration(data) {
        return this.adminService.createFeeConfiguration(data);
    }
    async updateFeeConfiguration(id, data) {
        return this.adminService.updateFeeConfiguration(id, data);
    }
    async deleteFeeConfiguration(id) {
        return this.adminService.deleteFeeConfiguration(id);
    }
    async getSystemSettings() {
        return this.adminService.getSystemSettings();
    }
    async updateSystemSetting(key, data) {
        return this.adminService.updateSystemSetting(key, data.value);
    }
    async createSystemSetting(data) {
        return this.adminService.createSystemSetting(data);
    }
    getPermissionsByRole(role) {
        const permissions = {
            ADMIN: [
                'view_dashboard',
                'view_users',
                'view_transfers',
                'update_kyc',
                'update_transfer_status',
                'view_logs',
                'manage_exchange_rates',
                'manage_fee_configurations',
                'view_system_settings',
            ],
            SUPER_ADMIN: [
                'view_dashboard',
                'view_users',
                'view_transfers',
                'update_kyc',
                'update_transfer_status',
                'view_logs',
                'update_user_roles',
                'deactivate_users',
                'manage_exchange_rates',
                'manage_fee_configurations',
                'manage_system_settings',
                'delete_fee_configurations',
            ],
        };
        return permissions[role] || [];
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get admin dashboard statistics',
        description: 'Retrieve comprehensive dashboard statistics including user counts, transfer volumes, revenue metrics, and pending KYC approvals.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard statistics retrieved successfully',
        example: {
            totalUsers: 1250,
            totalTransfers: 3456,
            totalRevenue: 125000.50,
            pendingTransfers: 23,
            completedTransfers: 3400,
            failedTransfers: 33,
            pendingKyc: 15
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions - Admin role required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get system activity logs',
        description: 'Retrieve system activity logs with pagination for monitoring user actions and system events.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System logs retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 50, description: 'Number of logs per page (max 100)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemLogs", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current admin profile',
        description: 'Get the current admin user profile with role-based permissions.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Admin profile retrieved successfully',
        example: {
            id: 'admin_123',
            email: 'admin@wayame.com',
            firstName: 'John',
            lastName: 'Admin',
            role: 'SUPER_ADMIN',
            permissions: ['view_dashboard', 'manage_users', 'system_settings']
        }
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminProfile", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - User Management'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users with pagination and filtering',
        description: 'Retrieve all registered users with advanced filtering by role, KYC status, and pagination support.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Users retrieved successfully',
        example: {
            users: [],
            pagination: {
                currentPage: 1,
                totalPages: 5,
                totalItems: 100,
                itemsPerPage: 20
            }
        }
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (max 50)' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], description: 'Filter by user role' }),
    (0, swagger_1.ApiQuery)({ name: 'kycStatus', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'], description: 'Filter by KYC status' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('role')),
    __param(3, (0, common_1.Query)('kycStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Put)('users/:id/role'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - User Management'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user role (Super Admin only)',
        description: 'Change a user\'s role. Only Super Admin can perform this action.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: 'user_123' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
                    description: 'New role for the user'
                }
            },
            required: ['role']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User role updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions - Super Admin role required' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Post)('users/create-admin'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - User Management'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new admin user (Super Admin only)',
        description: 'Create a new user with ADMIN or SUPER_ADMIN role. The created user will be automatically verified and KYC approved. Only Super Admin can perform this action.'
    }),
    (0, swagger_1.ApiBody)({
        type: admin_dto_1.CreateAdminUserDto,
        examples: {
            admin: {
                summary: 'Create Admin User',
                value: {
                    email: 'admin@wayame.com',
                    firstName: 'John',
                    lastName: 'Admin',
                    phoneNumber: '+2348012345678',
                    password: 'SecurePass123!',
                    role: 'ADMIN'
                }
            },
            superAdmin: {
                summary: 'Create Super Admin User',
                value: {
                    email: 'superadmin@wayame.com',
                    firstName: 'Jane',
                    lastName: 'SuperAdmin',
                    phoneNumber: '+2348087654321',
                    password: 'SuperSecure456!',
                    role: 'SUPER_ADMIN'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Admin user created successfully',
        example: {
            id: 'user_abc123',
            email: 'admin@wayame.com',
            firstName: 'John',
            lastName: 'Admin',
            phoneNumber: '+2348012345678',
            role: 'ADMIN',
            isVerified: true,
            kycStatus: 'APPROVED',
            createdAt: '2024-12-17T10:30:00Z',
            updatedAt: '2024-12-17T10:30:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error - invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflict - email or phone number already exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions - Super Admin role required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateAdminUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAdminUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/kyc'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - User Management'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update user KYC status',
        description: 'Approve, reject, or update KYC verification status for a user. Sends automatic notifications to the user.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: 'user_123' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                kycStatus: {
                    type: 'string',
                    enum: ['APPROVED', 'REJECTED', 'UNDER_REVIEW', 'PENDING'],
                    description: 'New KYC status'
                },
                reason: {
                    type: 'string',
                    description: 'Reason for rejection (required if status is REJECTED)',
                    example: 'Document quality too poor'
                }
            },
            required: ['kycStatus']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateKycStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateKycStatus", null);
__decorate([
    (0, common_1.Patch)('users/:id/deactivate'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - User Management'),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate user account (Super Admin only)',
        description: 'Deactivate a user account, cancel pending transfers, and disable payment methods. Cannot deactivate Super Admin accounts.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID to deactivate', example: 'user_123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot deactivate super admin account' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions - Super Admin role required' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deactivateUser", null);
__decorate([
    (0, common_1.Get)('transfers'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Transfer Management'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all transfers with pagination and filtering',
        description: 'Retrieve all money transfers with filtering by status and pagination support for admin oversight.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transfers retrieved successfully',
        example: {
            transfers: [],
            pagination: {
                currentPage: 1,
                totalPages: 10,
                totalItems: 200,
                itemsPerPage: 20
            }
        }
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (max 50)' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
        description: 'Filter by transfer status'
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllTransfers", null);
__decorate([
    (0, common_1.Patch)('transfers/:id/status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Transfer Management'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update transfer status',
        description: 'Manually update transfer status for administrative purposes. Sends notifications to users.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Transfer ID', example: 'transfer_123' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
                    description: 'New transfer status'
                },
                reason: {
                    type: 'string',
                    description: 'Reason for status change (optional)',
                    example: 'Manual review completed'
                }
            },
            required: ['status']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transfer status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transfer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdateTransferStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateTransferStatus", null);
__decorate([
    (0, common_1.Get)('exchange-rates'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Exchange Rates'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all exchange rates',
        description: 'Retrieve all currency exchange rates with buy/sell rates and last update timestamps.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Exchange rates retrieved successfully',
        example: [
            {
                id: 'rate_123',
                fromCurrency: 'NGN',
                toCurrency: 'USD',
                rate: 830.50,
                buyRate: 829.00,
                sellRate: 832.00,
                source: 'EXTERNAL_API',
                lastUpdated: '2024-11-14T10:30:00Z'
            }
        ]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllExchangeRates", null);
__decorate([
    (0, common_1.Post)('exchange-rates'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Exchange Rates'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new exchange rate',
        description: 'Create a new currency exchange rate pair.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Exchange rate created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreateExchangeRateDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createExchangeRate", null);
__decorate([
    (0, common_1.Put)('exchange-rates/:fromCurrency/:toCurrency'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Exchange Rates'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update exchange rate manually',
        description: 'Manually set exchange rates for specific currency pairs. This will override automatic rates from external APIs.'
    }),
    (0, swagger_1.ApiParam)({ name: 'fromCurrency', description: 'Source currency code', example: 'NGN' }),
    (0, swagger_1.ApiParam)({ name: 'toCurrency', description: 'Target currency code', example: 'USD' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                rate: { type: 'number', description: 'Exchange rate', example: 830.50 },
                buyRate: { type: 'number', description: 'Buy rate (optional)', example: 829.00 },
                sellRate: { type: 'number', description: 'Sell rate (optional)', example: 832.00 }
            },
            required: ['rate']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exchange rate updated successfully' }),
    __param(0, (0, common_1.Param)('fromCurrency')),
    __param(1, (0, common_1.Param)('toCurrency')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateExchangeRate", null);
__decorate([
    (0, common_1.Delete)('exchange-rates/:fromCurrency/:toCurrency'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Exchange Rates'),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate exchange rate',
        description: 'Deactivate an exchange rate pair. The system will fall back to default rates or external API rates.'
    }),
    (0, swagger_1.ApiParam)({ name: 'fromCurrency', description: 'Source currency code', example: 'NGN' }),
    (0, swagger_1.ApiParam)({ name: 'toCurrency', description: 'Target currency code', example: 'USD' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exchange rate deactivated successfully' }),
    __param(0, (0, common_1.Param)('fromCurrency')),
    __param(1, (0, common_1.Param)('toCurrency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deactivateExchangeRate", null);
__decorate([
    (0, common_1.Post)('exchange-rates/refresh'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Exchange Rates'),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh exchange rates from external API',
        description: 'Force refresh all exchange rates from external API sources. This may take a few seconds to complete.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Exchange rates refreshed successfully',
        example: { message: 'Exchange rates updated successfully', updatedCount: 15 }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "refreshExchangeRates", null);
__decorate([
    (0, common_1.Get)('fee-configurations'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Fee Configuration'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all fee configurations',
        description: 'Retrieve all fee configuration settings including transfer fees, currency conversion fees, and payment processing fees.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fee configurations retrieved successfully',
        example: [
            {
                id: 'fee_123',
                name: 'Standard Transfer Fee',
                type: 'TRANSFER_FEE',
                percentage: 2.5,
                fixedAmount: 50,
                currency: 'NGN',
                applicableTo: 'DOMESTIC,BANK_TRANSFER',
                isActive: true
            }
        ]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllFeeConfigurations", null);
__decorate([
    (0, common_1.Post)('fee-configurations'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Fee Configuration'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new fee configuration',
        description: 'Create a new fee configuration for transfers, currency conversions, or payment processing.'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Fee configuration name', example: 'Card Processing Fee' },
                type: {
                    type: 'string',
                    enum: ['TRANSFER_FEE', 'CURRENCY_CONVERSION_FEE', 'WITHDRAWAL_FEE', 'CARD_PROCESSING_FEE'],
                    description: 'Type of fee'
                },
                percentage: { type: 'number', description: 'Percentage fee (0-100)', example: 2.5 },
                fixedAmount: { type: 'number', description: 'Fixed amount fee', example: 50 },
                currency: { type: 'string', description: 'Currency code', example: 'NGN' },
                applicableTo: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Applicable to types (DOMESTIC, INTERNATIONAL, CARD, BANK_TRANSFER)',
                    example: ['DOMESTIC', 'BANK_TRANSFER']
                }
            },
            required: ['name', 'type']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Fee configuration created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createFeeConfiguration", null);
__decorate([
    (0, common_1.Put)('fee-configurations/:id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Fee Configuration'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update fee configuration',
        description: 'Update an existing fee configuration. Changes take effect immediately for new transactions.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Fee configuration ID', example: 'fee_123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee configuration updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fee configuration not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateFeeConfiguration", null);
__decorate([
    (0, common_1.Delete)('fee-configurations/:id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - Fee Configuration'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete fee configuration (Super Admin only)',
        description: 'Permanently delete a fee configuration. Use with caution - this action cannot be undone.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Fee configuration ID', example: 'fee_123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee configuration deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fee configuration not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions - Super Admin role required' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteFeeConfiguration", null);
__decorate([
    (0, common_1.Get)('system-settings'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - System Settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all system settings',
        description: 'Retrieve all system-wide configuration settings and their current values.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'System settings retrieved successfully',
        example: [
            {
                id: 'setting_123',
                key: 'MAX_TRANSFER_AMOUNT',
                value: '1000000',
                description: 'Maximum transfer amount in kobo',
                type: 'NUMBER',
                isActive: true
            }
        ]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemSettings", null);
__decorate([
    (0, common_1.Put)('system-settings/:key'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - System Settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update system setting (Super Admin only)',
        description: 'Update a system-wide setting value. Changes may require application restart depending on the setting.'
    }),
    (0, swagger_1.ApiParam)({ name: 'key', description: 'Setting key', example: 'MAX_TRANSFER_AMOUNT' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                value: { type: 'string', description: 'New setting value', example: '2000000' }
            },
            required: ['value']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System setting updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions - Super Admin role required' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSystemSetting", null);
__decorate([
    (0, common_1.Post)('system-settings'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiTags)('Admin - System Settings'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new system setting (Super Admin only)',
        description: 'Create a new system-wide configuration setting.'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Setting key (unique)', example: 'NEW_FEATURE_ENABLED' },
                value: { type: 'string', description: 'Setting value', example: 'true' },
                description: { type: 'string', description: 'Setting description', example: 'Enable new feature' },
                type: {
                    type: 'string',
                    enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'],
                    description: 'Value type',
                    example: 'BOOLEAN'
                }
            },
            required: ['key', 'value']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'System setting created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions - Super Admin role required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSystemSetting", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map