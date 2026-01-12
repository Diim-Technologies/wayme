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
exports.AdminKycController = exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const kyc_service_1 = require("./kyc.service");
const kyc_dto_1 = require("./dto/kyc.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const multer_config_1 = require("../config/multer.config");
const kyc_enum_1 = require("../enums/kyc.enum");
let KycController = class KycController {
    constructor(kycService) {
        this.kycService = kycService;
    }
    async uploadGovernmentId(req, file, dto) {
        if (dto.documentType === kyc_enum_1.DocumentType.SELFIE) {
            return { message: 'Invalid document type for this endpoint. Use /upload/selfie' };
        }
        return this.kycService.uploadDocument(req.user.id, file, dto.documentType);
    }
    async uploadSelfie(req, file) {
        return this.kycService.uploadDocument(req.user.id, file, kyc_enum_1.DocumentType.SELFIE);
    }
    async submitKyc(req) {
        return this.kycService.submitKyc(req.user.id);
    }
    async getMyDocuments(req) {
        return this.kycService.getMyDocuments(req.user.id);
    }
    async getKycStatus(req) {
        return this.kycService.getKycStatus(req.user.id);
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)('upload/government-id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerConfig)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload government ID (Passport, National ID, Residence Permit)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, kyc_dto_1.UploadDocumentDto]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "uploadGovernmentId", null);
__decorate([
    (0, common_1.Post)('upload/selfie'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.multerConfig)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload selfie (Optional but Recommended)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "uploadSelfie", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit KYC for review' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "submitKyc", null);
__decorate([
    (0, common_1.Get)('my-documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my uploaded KYC documents' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getMyDocuments", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my KYC status' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getKycStatus", null);
exports.KycController = KycController = __decorate([
    (0, swagger_1.ApiTags)('KYC'),
    (0, common_1.Controller)('kyc'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [kyc_service_1.KycService])
], KycController);
let AdminKycController = class AdminKycController {
    constructor(kycService) {
        this.kycService = kycService;
    }
    async getAllSubmissions(page, limit, filters) {
        return this.kycService.getAllSubmissions(page ? Number(page) : 1, limit ? Number(limit) : 20, filters);
    }
    async getUserKyc(userId) {
        return this.kycService.getUserKyc(userId);
    }
    async approveKyc(req, userId) {
        return this.kycService.approveKyc(userId, req.user.id);
    }
    async rejectKyc(req, userId, rejectDto) {
        return this.kycService.rejectKyc(userId, req.user.id, rejectDto);
    }
};
exports.AdminKycController = AdminKycController;
__decorate([
    (0, common_1.Get)('submissions'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all KYC submissions' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, kyc_dto_1.KycFilterDto]),
    __metadata("design:returntype", Promise)
], AdminKycController.prototype, "getAllSubmissions", null);
__decorate([
    (0, common_1.Get)(':userId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user KYC details and documents' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminKycController.prototype, "getUserKyc", null);
__decorate([
    (0, common_1.Post)(':userId/approve'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve user KYC' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminKycController.prototype, "approveKyc", null);
__decorate([
    (0, common_1.Post)(':userId/reject'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject user KYC' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, kyc_dto_1.RejectKycDto]),
    __metadata("design:returntype", Promise)
], AdminKycController.prototype, "rejectKyc", null);
exports.AdminKycController = AdminKycController = __decorate([
    (0, swagger_1.ApiTags)('Admin - KYC'),
    (0, common_1.Controller)('admin/kyc'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [kyc_service_1.KycService])
], AdminKycController);
//# sourceMappingURL=kyc.controller.js.map