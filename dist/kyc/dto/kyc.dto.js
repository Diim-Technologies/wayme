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
exports.KycFilterDto = exports.RejectKycDto = exports.SubmitKycDto = exports.UploadDocumentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const kyc_enum_1 = require("../../enums/kyc.enum");
const user_enum_1 = require("../../enums/user.enum");
class UploadDocumentDto {
}
exports.UploadDocumentDto = UploadDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'NATIONAL_ID',
        enum: kyc_enum_1.DocumentType,
        description: 'Type of document being uploaded'
    }),
    (0, class_validator_1.IsEnum)(kyc_enum_1.DocumentType),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "documentType", void 0);
class SubmitKycDto {
}
exports.SubmitKycDto = SubmitKycDto;
class RejectKycDto {
}
exports.RejectKycDto = RejectKycDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Document is not clear enough. Please upload a clearer image.',
        description: 'Reason for rejecting the KYC'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], RejectKycDto.prototype, "reason", void 0);
class KycFilterDto {
}
exports.KycFilterDto = KycFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'PENDING',
        enum: user_enum_1.KycStatus,
        description: 'Filter by KYC status'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_enum_1.KycStatus),
    __metadata("design:type", String)
], KycFilterDto.prototype, "status", void 0);
//# sourceMappingURL=kyc.dto.js.map