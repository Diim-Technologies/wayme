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
exports.AdminDisputesController = exports.DisputesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const disputes_service_1 = require("./disputes.service");
const disputes_dto_1 = require("./dto/disputes.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let DisputesController = class DisputesController {
    constructor(disputesService) {
        this.disputesService = disputesService;
    }
    async createDispute(req, createDisputeDto) {
        return this.disputesService.createDispute(req.user.id, createDisputeDto);
    }
    async getMyDisputes(req, page, limit, filters) {
        return this.disputesService.getMyDisputes(req.user.id, page ? Number(page) : 1, limit ? Number(limit) : 20, filters);
    }
    async getDisputeById(req, disputeId) {
        return this.disputesService.getDisputeById(disputeId, req.user.id);
    }
    async replyToDispute(req, disputeId, replyDto) {
        return this.disputesService.replyToDispute(disputeId, req.user.id, replyDto, false);
    }
};
exports.DisputesController = DisputesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new dispute',
        description: 'Create a dispute for a transaction. Users can only create disputes for their own transactions.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Dispute created successfully',
        example: {
            id: 'dispute_123',
            transactionId: 'trans_456',
            userId: 'user_789',
            category: 'DELAYED_TRANSFER',
            status: 'OPEN',
            subject: 'Transfer not received',
            description: 'I sent money 3 days ago but recipient has not received it',
            priority: 'HIGH',
            createdAt: '2026-01-10T18:00:00Z',
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data or dispute already exists' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot create dispute for this transaction' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, disputes_dto_1.CreateDisputeDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "createDispute", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my disputes',
        description: 'Retrieve all disputes created by the authenticated user with pagination and filtering.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, enum: ['WRONG_AMOUNT', 'DELAYED_TRANSFER', 'UNAUTHORIZED', 'FAILED_TRANSACTION', 'POOR_SERVICE', 'OTHER'] }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Disputes retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, disputes_dto_1.DisputeFilterDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "getMyDisputes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get dispute details',
        description: 'Retrieve detailed information about a specific dispute including all messages.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot view this dispute' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "getDisputeById", null);
__decorate([
    (0, common_1.Post)(':id/reply'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reply to a dispute',
        description: 'Add a message to an existing dispute. Users can only reply to their own disputes.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Reply added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot reply to closed dispute' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot reply to this dispute' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, disputes_dto_1.ReplyDisputeDto]),
    __metadata("design:returntype", Promise)
], DisputesController.prototype, "replyToDispute", null);
exports.DisputesController = DisputesController = __decorate([
    (0, swagger_1.ApiTags)('Disputes'),
    (0, common_1.Controller)('disputes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [disputes_service_1.DisputesService])
], DisputesController);
let AdminDisputesController = class AdminDisputesController {
    constructor(disputesService) {
        this.disputesService = disputesService;
    }
    async getAllDisputes(page, limit, filters) {
        return this.disputesService.getAllDisputes(page ? Number(page) : 1, limit ? Number(limit) : 20, filters);
    }
    async getDisputeById(req, disputeId) {
        return this.disputesService.getDisputeById(disputeId, req.user.id, true);
    }
    async replyToDispute(req, disputeId, replyDto) {
        return this.disputesService.replyToDispute(disputeId, req.user.id, replyDto, true);
    }
    async updateDisputeStatus(req, disputeId, updateDto) {
        return this.disputesService.updateDisputeStatus(disputeId, updateDto, req.user.id);
    }
    async closeDispute(req, disputeId, closeDto) {
        return this.disputesService.closeDispute(disputeId, closeDto, req.user.id);
    }
};
exports.AdminDisputesController = AdminDisputesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all disputes (Admin)',
        description: 'Retrieve all disputes in the system with pagination and filtering.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, enum: ['WRONG_AMOUNT', 'DELAYED_TRANSFER', 'UNAUTHORIZED', 'FAILED_TRANSACTION', 'POOR_SERVICE', 'OTHER'] }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Disputes retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, disputes_dto_1.DisputeFilterDto]),
    __metadata("design:returntype", Promise)
], AdminDisputesController.prototype, "getAllDisputes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get dispute details (Admin)',
        description: 'Retrieve detailed information about any dispute.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminDisputesController.prototype, "getDisputeById", null);
__decorate([
    (0, common_1.Post)(':id/reply'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reply to dispute (Admin)',
        description: 'Add an admin reply to a dispute. This will update the dispute status to IN_PROGRESS if it was OPEN.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Admin reply added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot reply to closed dispute' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, disputes_dto_1.ReplyDisputeDto]),
    __metadata("design:returntype", Promise)
], AdminDisputesController.prototype, "replyToDispute", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update dispute status (Admin)',
        description: 'Change the status of a dispute (OPEN, IN_PROGRESS, RESOLVED, CLOSED).',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, disputes_dto_1.UpdateDisputeStatusDto]),
    __metadata("design:returntype", Promise)
], AdminDisputesController.prototype, "updateDisputeStatus", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({
        summary: 'Close dispute (Admin)',
        description: 'Close a dispute with a resolution message. This marks the dispute as CLOSED and adds a final resolution message.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Dispute ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute closed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dispute is already closed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispute not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, disputes_dto_1.CloseDisputeDto]),
    __metadata("design:returntype", Promise)
], AdminDisputesController.prototype, "closeDispute", null);
exports.AdminDisputesController = AdminDisputesController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Disputes'),
    (0, common_1.Controller)('admin/disputes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [disputes_service_1.DisputesService])
], AdminDisputesController);
//# sourceMappingURL=disputes.controller.js.map