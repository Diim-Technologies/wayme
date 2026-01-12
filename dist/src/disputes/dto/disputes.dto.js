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
exports.DisputeFilterDto = exports.CloseDisputeDto = exports.UpdateDisputeStatusDto = exports.ReplyDisputeDto = exports.CreateDisputeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const dispute_enum_1 = require("../../enums/dispute.enum");
class CreateDisputeDto {
}
exports.CreateDisputeDto = CreateDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'trans_123',
        description: 'Transaction ID to dispute'
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'DELAYED_TRANSFER',
        enum: dispute_enum_1.DisputeCategory,
        description: 'Category of the dispute'
    }),
    (0, class_validator_1.IsEnum)(dispute_enum_1.DisputeCategory),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Transfer not received',
        description: 'Brief subject of the dispute'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'I sent money 3 days ago but the recipient has not received it yet. Transaction reference: TXN123456',
        description: 'Detailed description of the issue'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'HIGH',
        enum: dispute_enum_1.DisputePriority,
        description: 'Priority level of the dispute',
        default: 'MEDIUM'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(dispute_enum_1.DisputePriority),
    __metadata("design:type", String)
], CreateDisputeDto.prototype, "priority", void 0);
class ReplyDisputeDto {
}
exports.ReplyDisputeDto = ReplyDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'I have checked with the recipient and they confirm they have not received the funds.',
        description: 'Reply message'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], ReplyDisputeDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['https://example.com/screenshot.png'],
        description: 'Optional attachment URLs',
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ReplyDisputeDto.prototype, "attachments", void 0);
class UpdateDisputeStatusDto {
}
exports.UpdateDisputeStatusDto = UpdateDisputeStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'IN_PROGRESS',
        enum: dispute_enum_1.DisputeStatus,
        description: 'New status for the dispute'
    }),
    (0, class_validator_1.IsEnum)(dispute_enum_1.DisputeStatus),
    __metadata("design:type", String)
], UpdateDisputeStatusDto.prototype, "status", void 0);
class CloseDisputeDto {
}
exports.CloseDisputeDto = CloseDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Issue resolved. The transfer was completed successfully and the recipient has confirmed receipt of funds.',
        description: 'Resolution message explaining how the dispute was resolved'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], CloseDisputeDto.prototype, "resolution", void 0);
class DisputeFilterDto {
}
exports.DisputeFilterDto = DisputeFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'OPEN',
        enum: dispute_enum_1.DisputeStatus,
        description: 'Filter by dispute status'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(dispute_enum_1.DisputeStatus),
    __metadata("design:type", String)
], DisputeFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'DELAYED_TRANSFER',
        enum: dispute_enum_1.DisputeCategory,
        description: 'Filter by dispute category'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(dispute_enum_1.DisputeCategory),
    __metadata("design:type", String)
], DisputeFilterDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'HIGH',
        enum: dispute_enum_1.DisputePriority,
        description: 'Filter by priority'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(dispute_enum_1.DisputePriority),
    __metadata("design:type", String)
], DisputeFilterDto.prototype, "priority", void 0);
//# sourceMappingURL=disputes.dto.js.map