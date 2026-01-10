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
exports.BeneficiariesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const beneficiaries_service_1 = require("./beneficiaries.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_enum_1 = require("../enums/user.enum");
let BeneficiariesController = class BeneficiariesController {
    constructor(beneficiariesService) {
        this.beneficiariesService = beneficiariesService;
    }
    async createBeneficiary(req, body) {
        return this.beneficiariesService.createBeneficiary(req.user.id, body);
    }
    async getUserBeneficiaries(req) {
        return this.beneficiariesService.getUserBeneficiaries(req.user.id);
    }
    async getAllBeneficiaries() {
        return this.beneficiariesService.getAllBeneficiaries();
    }
    async deleteBeneficiary(req, id) {
        return this.beneficiariesService.deleteBeneficiary(id, req.user.id);
    }
};
exports.BeneficiariesController = BeneficiariesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new beneficiary',
        description: 'Save beneficiary details for quick access during transfers. Beneficiary information includes name, account details, bank, email, and phone number.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Beneficiary created successfully',
        example: {
            id: 'ben_123',
            userId: 'user_456',
            name: 'Jane Doe',
            accountName: 'Jane Doe',
            accountNumber: '0123456789',
            bankName: 'First Bank',
            bankCode: '011',
            email: 'jane@example.com',
            phoneNumber: '+2348123456789',
            createdAt: '2024-11-28T10:00:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid beneficiary data or validation errors' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Beneficiary already exists for this user' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BeneficiariesController.prototype, "createBeneficiary", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user beneficiaries',
        description: 'Retrieve all saved beneficiaries for the authenticated user. Returns a list of beneficiary details for quick transfers.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Beneficiaries retrieved successfully',
        example: [
            {
                id: 'ben_123',
                userId: 'user_456',
                name: 'Jane Doe',
                accountName: 'Jane Doe',
                accountNumber: '0123456789',
                bankName: 'First Bank',
                bankCode: '011',
                email: 'jane@example.com',
                phoneNumber: '+2348123456789',
                createdAt: '2024-11-28T10:00:00Z'
            },
            {
                id: 'ben_124',
                userId: 'user_456',
                name: 'John Smith',
                accountName: 'John Smith',
                accountNumber: '9876543210',
                bankName: 'GTBank',
                bankCode: '058',
                email: 'john@example.com',
                phoneNumber: '+2348098765432',
                createdAt: '2024-11-27T15:30:00Z'
            }
        ]
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BeneficiariesController.prototype, "getUserBeneficiaries", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_enum_1.UserRole.ADMIN, user_enum_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all beneficiaries (Admin only)',
        description: 'Retrieve all beneficiaries across all users. This endpoint is restricted to administrators and super administrators for monitoring and support purposes.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All beneficiaries retrieved successfully',
        example: [
            {
                id: 'ben_123',
                userId: 'user_456',
                userName: 'Alice Johnson',
                name: 'Jane Doe',
                accountName: 'Jane Doe',
                accountNumber: '0123456789',
                bankName: 'First Bank',
                bankCode: '011',
                email: 'jane@example.com',
                phoneNumber: '+2348123456789',
                createdAt: '2024-11-28T10:00:00Z'
            }
        ]
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BeneficiariesController.prototype, "getAllBeneficiaries", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a beneficiary',
        description: 'Remove a saved beneficiary from the user\'s list. Users can only delete their own beneficiaries.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Beneficiary ID to delete',
        example: 'ben_123',
        type: 'string'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Beneficiary deleted successfully',
        example: {
            message: 'Beneficiary deleted successfully',
            deleted: true
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot delete another user\'s beneficiary' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Beneficiary not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BeneficiariesController.prototype, "deleteBeneficiary", null);
exports.BeneficiariesController = BeneficiariesController = __decorate([
    (0, swagger_1.ApiTags)('Beneficiaries'),
    (0, common_1.Controller)('beneficiaries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [beneficiaries_service_1.BeneficiariesService])
], BeneficiariesController);
//# sourceMappingURL=beneficiaries.controller.js.map