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
exports.VerifyAdminOtpDto = exports.RequestAdminVerificationDto = exports.UpdateFeeConfigurationDto = exports.CreateFeeConfigurationDto = exports.CreateAdminUserDto = exports.CreateExchangeRateDto = exports.AdminStatsDto = exports.UpdateTransferStatusDto = exports.UpdateKycStatusDto = exports.UpdateUserRoleDto = void 0;
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
class CreateAdminUserDto {
}
exports.CreateAdminUserDto = CreateAdminUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'admin@wayame.com',
        description: 'Admin user email address'
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'John',
        description: 'Admin user first name'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters long' }),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Doe',
        description: 'Admin user last name'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Last name must be at least 2 characters long' }),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+2348012345678',
        description: 'Admin user phone number (international format)'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+?[1-9]\d{1,14}$/, {
        message: 'Please provide a valid phone number in international format'
    }),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'SecurePass123!',
        description: 'Admin user password (min 8 characters, must include uppercase, lowercase, number, and special character)'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'ADMIN',
        enum: ['ADMIN', 'SUPER_ADMIN'],
        description: 'Role to assign to the admin user'
    }),
    (0, class_validator_1.IsEnum)(['ADMIN', 'SUPER_ADMIN'], {
        message: 'Role must be either ADMIN or SUPER_ADMIN'
    }),
    __metadata("design:type", String)
], CreateAdminUserDto.prototype, "role", void 0);
const common_enum_1 = require("../../enums/common.enum");
class CreateFeeConfigurationDto {
}
exports.CreateFeeConfigurationDto = CreateFeeConfigurationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Card Processing Fee', description: 'Fee configuration name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateFeeConfigurationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'TRANSFER_FEE',
        enum: common_enum_1.FeeType,
        description: 'Type of fee'
    }),
    (0, class_validator_1.IsEnum)(common_enum_1.FeeType, {
        message: `Type must be one of: ${Object.values(common_enum_1.FeeType).join(', ')}`
    }),
    __metadata("design:type", String)
], CreateFeeConfigurationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2.5, description: 'Percentage fee (0-100)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFeeConfigurationDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50, description: 'Fixed amount fee' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFeeConfigurationDto.prototype, "fixedAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'NGN', description: 'Currency code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFeeConfigurationDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['DOMESTIC', 'BANK_TRANSFER'],
        description: 'Applicable to types'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateFeeConfigurationDto.prototype, "applicableTo", void 0);
class UpdateFeeConfigurationDto {
}
exports.UpdateFeeConfigurationDto = UpdateFeeConfigurationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2.5, description: 'Percentage fee (0-100)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateFeeConfigurationDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50, description: 'Fixed amount fee' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateFeeConfigurationDto.prototype, "fixedAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['DOMESTIC', 'BANK_TRANSFER'],
        description: 'Applicable to types'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateFeeConfigurationDto.prototype, "applicableTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Is fee active' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateFeeConfigurationDto.prototype, "isActive", void 0);
class RequestAdminVerificationDto {
}
exports.RequestAdminVerificationDto = RequestAdminVerificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@wayame.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RequestAdminVerificationDto.prototype, "email", void 0);
class VerifyAdminOtpDto {
}
exports.VerifyAdminOtpDto = VerifyAdminOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@wayame.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], VerifyAdminOtpDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], VerifyAdminOtpDto.prototype, "code", void 0);
//# sourceMappingURL=admin.dto.js.map