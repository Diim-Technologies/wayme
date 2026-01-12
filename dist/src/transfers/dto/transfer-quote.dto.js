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
exports.TransferQuoteResponseDto = exports.TransferQuoteDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TransferQuoteDto {
}
exports.TransferQuoteDto = TransferQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000, description: 'Amount to transfer' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TransferQuoteDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NGN', description: 'Source currency code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferQuoteDto.prototype, "fromCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'Target currency code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferQuoteDto.prototype, "toCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BANK_TRANSFER', description: 'Payment method (CARD, BANK_TRANSFER, etc.)', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransferQuoteDto.prototype, "paymentMethod", void 0);
class TransferQuoteResponseDto {
}
exports.TransferQuoteResponseDto = TransferQuoteResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    __metadata("design:type", Number)
], TransferQuoteResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NGN' }),
    __metadata("design:type", String)
], TransferQuoteResponseDto.prototype, "fromCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    __metadata("design:type", String)
], TransferQuoteResponseDto.prototype, "toCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.0012, description: 'Exchange rate' }),
    __metadata("design:type", Number)
], TransferQuoteResponseDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1.2, description: 'Amount in target currency' }),
    __metadata("design:type", Number)
], TransferQuoteResponseDto.prototype, "convertedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, description: 'Transfer fee' }),
    __metadata("design:type", Number)
], TransferQuoteResponseDto.prototype, "transferFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Currency conversion fee' }),
    __metadata("design:type", Number)
], TransferQuoteResponseDto.prototype, "conversionFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 55, description: 'Total fees' }),
    __metadata("design:type", Number)
], TransferQuoteResponseDto.prototype, "totalFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1055, description: 'Total amount to pay (amount + fees)' }),
    __metadata("design:type", Number)
], TransferQuoteResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quote expiration time (15 minutes)' }),
    __metadata("design:type", Date)
], TransferQuoteResponseDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=transfer-quote.dto.js.map