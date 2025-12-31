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
exports.Fee = void 0;
const typeorm_1 = require("typeorm");
const common_enum_1 = require("../enums/common.enum");
let Fee = class Fee {
};
exports.Fee = Fee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Fee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: common_enum_1.FeeType,
    }),
    __metadata("design:type", String)
], Fee.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Fee.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Fee.prototype, "fixedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 4, nullable: true }),
    __metadata("design:type", Number)
], Fee.prototype, "percentageRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'NGN' }),
    __metadata("design:type", String)
], Fee.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Fee.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Fee.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Fee.prototype, "updatedAt", void 0);
exports.Fee = Fee = __decorate([
    (0, typeorm_1.Entity)('fees')
], Fee);
//# sourceMappingURL=fee.entity.js.map