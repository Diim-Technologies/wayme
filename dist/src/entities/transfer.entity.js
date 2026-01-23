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
exports.Transfer = void 0;
const typeorm_1 = require("typeorm");
const common_enum_1 = require("../enums/common.enum");
const transaction_entity_1 = require("./transaction.entity");
const payment_method_entity_1 = require("./payment-method.entity");
const user_entity_1 = require("./user.entity");
const bank_entity_1 = require("./bank.entity");
const dispute_entity_1 = require("./dispute.entity");
let Transfer = class Transfer {
};
exports.Transfer = Transfer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transfer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transfer.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transfer.prototype, "receiverId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 2 }),
    __metadata("design:type", Number)
], Transfer.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 2 }),
    __metadata("design:type", Number)
], Transfer.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Transfer.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'NGN' }),
    __metadata("design:type", String)
], Transfer.prototype, "sourceCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'NGN' }),
    __metadata("design:type", String)
], Transfer.prototype, "targetCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Transfer.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: common_enum_1.TransferStatus,
        default: common_enum_1.TransferStatus.PENDING,
    }),
    __metadata("design:type", String)
], Transfer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Transfer.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transfer.prototype, "paymentMethodId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transfer.prototype, "recipientBankId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transfer.prototype, "recipientAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transfer.prototype, "recipientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transfer.prototype, "recipientPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Transfer.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transfer.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Transfer.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Transfer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Transfer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.transfer),
    __metadata("design:type", Array)
], Transfer.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_method_entity_1.PaymentMethod, (paymentMethod) => paymentMethod.transfers),
    (0, typeorm_1.JoinColumn)({ name: 'paymentMethodId' }),
    __metadata("design:type", payment_method_entity_1.PaymentMethod)
], Transfer.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedTransfers, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'receiverId' }),
    __metadata("design:type", user_entity_1.User)
], Transfer.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_entity_1.Bank, (bank) => bank.transfers, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'recipientBankId' }),
    __metadata("design:type", bank_entity_1.Bank)
], Transfer.prototype, "recipientBank", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sentTransfers),
    (0, typeorm_1.JoinColumn)({ name: 'senderId' }),
    __metadata("design:type", user_entity_1.User)
], Transfer.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => dispute_entity_1.Dispute, (dispute) => dispute.transfer),
    __metadata("design:type", Array)
], Transfer.prototype, "disputes", void 0);
exports.Transfer = Transfer = __decorate([
    (0, typeorm_1.Entity)('transfers')
], Transfer);
//# sourceMappingURL=transfer.entity.js.map