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
exports.PaymentIntentResponseDto = exports.CreatePaymentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePaymentDto {
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'WMT-1733403411000-ABC123', description: 'Transfer reference ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "transferReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Specific Stripe payment method type (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "paymentMethodType", void 0);
class PaymentIntentResponseDto {
}
exports.PaymentIntentResponseDto = PaymentIntentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stripe client secret for payment' }),
    __metadata("design:type", String)
], PaymentIntentResponseDto.prototype, "clientSecret", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stripe payment intent ID' }),
    __metadata("design:type", String)
], PaymentIntentResponseDto.prototype, "paymentIntentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1055, description: 'Total amount to pay' }),
    __metadata("design:type", Number)
], PaymentIntentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ngn', description: 'Currency code (lowercase)' }),
    __metadata("design:type", String)
], PaymentIntentResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'WMT-1733403411000-ABC123' }),
    __metadata("design:type", String)
], PaymentIntentResponseDto.prototype, "transferReference", void 0);
//# sourceMappingURL=create-payment.dto.js.map