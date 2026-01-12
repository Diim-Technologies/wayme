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
exports.ApproveTransferDto = exports.ProceedToTransferResponseDto = exports.CreateTransferDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTransferDto {
}
exports.CreateTransferDto = CreateTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000, description: 'Amount to transfer' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NGN', description: 'Source currency code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "fromCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'Target currency code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "toCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'Recipient full name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient bank UUID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "recipientBankId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234567890', description: 'Recipient account number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "recipientAccount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+2348012345678', description: 'Recipient phone number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "recipientPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Family support', description: 'Transfer purpose' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "purpose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Monthly allowance', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "notes", void 0);
class ProceedToTransferResponseDto {
}
exports.ProceedToTransferResponseDto = ProceedToTransferResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'WMT-1733403411000-ABC123' }),
    __metadata("design:type", String)
], ProceedToTransferResponseDto.prototype, "referenceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    __metadata("design:type", Number)
], ProceedToTransferResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NGN' }),
    __metadata("design:type", String)
], ProceedToTransferResponseDto.prototype, "fromCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    __metadata("design:type", String)
], ProceedToTransferResponseDto.prototype, "toCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.0012 }),
    __metadata("design:type", Number)
], ProceedToTransferResponseDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    __metadata("design:type", Number)
], ProceedToTransferResponseDto.prototype, "transferFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], ProceedToTransferResponseDto.prototype, "conversionFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 55 }),
    __metadata("design:type", Number)
], ProceedToTransferResponseDto.prototype, "totalFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1055 }),
    __metadata("design:type", Number)
], ProceedToTransferResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PENDING' }),
    __metadata("design:type", String)
], ProceedToTransferResponseDto.prototype, "status", void 0);
class ApproveTransferDto {
}
exports.ApproveTransferDto = ApproveTransferDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveTransferDto.prototype, "notes", void 0);
//# sourceMappingURL=create-transfer.dto.js.map