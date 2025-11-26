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
exports.AddBankAccountDto = exports.AddCardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AddCardDto {
}
exports.AddCardDto = AddCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '4111111111111111' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(13, 19),
    __metadata("design:type", String)
], AddCardDto.prototype, "cardNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], AddCardDto.prototype, "expiryMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2025 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(new Date().getFullYear()),
    __metadata("design:type", Number)
], AddCardDto.prototype, "expiryYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 4),
    __metadata("design:type", String)
], AddCardDto.prototype, "cvc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCardDto.prototype, "holderName", void 0);
class AddBankAccountDto {
}
exports.AddBankAccountDto = AddBankAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0123456789' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(10, 10),
    __metadata("design:type", String)
], AddBankAccountDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddBankAccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Access Bank' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddBankAccountDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '044' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddBankAccountDto.prototype, "bankCode", void 0);
//# sourceMappingURL=payments.dto.js.map