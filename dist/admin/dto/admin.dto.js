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
exports.CreateExchangeRateDto = exports.AdminStatsDto = exports.UpdateTransferStatusDto = exports.UpdateKycStatusDto = exports.UpdateUserRoleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateUserRoleDto {
}
exports.UpdateUserRoleDto = UpdateUserRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ADMIN', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] }),
    (0, class_validator_1.IsEnum)(['USER', 'ADMIN', 'SUPER_ADMIN']),
    __metadata("design:type", String)
], UpdateUserRoleDto.prototype, "role", void 0);
class UpdateKycStatusDto {
}
exports.UpdateKycStatusDto = UpdateKycStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'] }),
    (0, class_validator_1.IsEnum)(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW']),
    __metadata("design:type", String)
], UpdateKycStatusDto.prototype, "kycStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Invalid document provided' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKycStatusDto.prototype, "reason", void 0);
class UpdateTransferStatusDto {
}
exports.UpdateTransferStatusDto = UpdateTransferStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'COMPLETED', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'] }),
    (0, class_validator_1.IsEnum)(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']),
    __metadata("design:type", String)
], UpdateTransferStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Insufficient funds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransferStatusDto.prototype, "reason", void 0);
class AdminStatsDto {
}
exports.AdminStatsDto = AdminStatsDto;
class CreateExchangeRateDto {
}
exports.CreateExchangeRateDto = CreateExchangeRateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'Source currency code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExchangeRateDto.prototype, "fromCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NGN', description: 'Target currency code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExchangeRateDto.prototype, "toCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 850.50, description: 'Exchange rate' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExchangeRateDto.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 845.00, description: 'Buy rate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExchangeRateDto.prototype, "buyRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 855.00, description: 'Sell rate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateExchangeRateDto.prototype, "sellRate", void 0);
//# sourceMappingURL=admin.dto.js.map