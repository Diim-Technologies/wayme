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
exports.TransfersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_enum_1 = require("../enums/user.enum");
const transfers_service_1 = require("./transfers.service");
const transfer_quote_dto_1 = require("./dto/transfer-quote.dto");
const create_transfer_dto_1 = require("./dto/create-transfer.dto");
let TransfersController = class TransfersController {
    constructor(transfersService) {
        this.transfersService = transfersService;
    }
    async getQuote(dto) {
        return this.transfersService.getTransferQuote(dto);
    }
    async proceedToTransfer(req, dto) {
        return this.transfersService.proceedToTransfer(req.user.userId, dto);
    }
    async getUserTransfers(req, page = 1, limit = 10, status) {
        return this.transfersService.getUserTransfers(req.user.userId, Number(page), Number(limit), status);
    }
    async getTransferByReference(req, reference) {
        return this.transfersService.getTransferByReference(reference, req.user.userId);
    }
    async approveTransfer(req, id, dto) {
        return this.transfersService.approveTransfer(id, req.user.userId, dto.notes);
    }
};
exports.TransfersController = TransfersController;
__decorate([
    (0, common_1.Post)('quote'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transfer quote with exchange rate and fees' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quote calculated successfully', type: transfer_quote_dto_1.TransferQuoteResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_quote_dto_1.TransferQuoteDto]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "getQuote", null);
__decorate([
    (0, common_1.Post)('proceed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create transfer and generate reference ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transfer created successfully', type: create_transfer_dto_1.ProceedToTransferResponseDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_transfer_dto_1.CreateTransferDto]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "proceedToTransfer", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user transfers with pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transfers retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "getUserTransfers", null);
__decorate([
    (0, common_1.Get)(':reference'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get transfer by reference ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transfer found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transfer not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "getTransferByReference", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Approve transfer (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transfer approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Transfer cannot be approved' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_transfer_dto_1.ApproveTransferDto]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "approveTransfer", null);
exports.TransfersController = TransfersController = __decorate([
    (0, swagger_1.ApiTags)('Transfers'),
    (0, common_1.Controller)('transfers'),
    __metadata("design:paramtypes", [transfers_service_1.TransfersService])
], TransfersController);
//# sourceMappingURL=transfers.controller.js.map