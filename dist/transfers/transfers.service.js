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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransfersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const transfer_entity_1 = require("../entities/transfer.entity");
const user_entity_1 = require("../entities/user.entity");
const common_enum_1 = require("../enums/common.enum");
const currency_service_1 = require("../common/services/currency.service");
const fee_service_1 = require("../common/services/fee.service");
let TransfersService = TransfersService_1 = class TransfersService {
    constructor(transferRepository, userRepository, currencyService, feeService) {
        this.transferRepository = transferRepository;
        this.userRepository = userRepository;
        this.currencyService = currencyService;
        this.feeService = feeService;
        this.logger = new common_1.Logger(TransfersService_1.name);
    }
    async getTransferQuote(dto) {
        const amount = new decimal_js_1.Decimal(dto.amount);
        const exchangeRate = await this.currencyService.getExchangeRate(dto.fromCurrency, dto.toCurrency);
        const convertedAmount = amount.mul(exchangeRate);
        const transferFee = await this.feeService.calculateTransferFee(amount, dto.fromCurrency === dto.toCurrency ? 'DOMESTIC' : 'INTERNATIONAL', dto.paymentMethod || 'CARD', dto.fromCurrency);
        const conversionFee = await this.feeService.calculateCurrencyConversionFee(amount, dto.fromCurrency, dto.toCurrency);
        const totalFee = transferFee.add(conversionFee);
        const totalAmount = amount.add(totalFee);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        return {
            amount: amount.toNumber(),
            fromCurrency: dto.fromCurrency,
            toCurrency: dto.toCurrency,
            exchangeRate: exchangeRate.toNumber(),
            convertedAmount: convertedAmount.toNumber(),
            transferFee: transferFee.toNumber(),
            conversionFee: conversionFee.toNumber(),
            totalFee: totalFee.toNumber(),
            totalAmount: totalAmount.toNumber(),
            expiresAt,
        };
    }
    async proceedToTransfer(userId, dto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const quote = await this.getTransferQuote({
            amount: dto.amount,
            fromCurrency: dto.fromCurrency,
            toCurrency: dto.toCurrency,
        });
        const reference = this.generateReferenceId();
        const transfer = this.transferRepository.create({
            id: (0, crypto_1.randomUUID)(),
            sender: user,
            amount: dto.amount,
            fee: quote.totalFee,
            exchangeRate: quote.exchangeRate,
            sourceCurrency: dto.fromCurrency,
            targetCurrency: dto.toCurrency,
            purpose: dto.purpose,
            status: common_enum_1.TransferStatus.PENDING,
            reference,
            recipientBankId: dto.recipientBankId,
            recipientAccount: dto.recipientAccount,
            recipientName: dto.recipientName,
            recipientPhone: dto.recipientPhone,
            notes: dto.notes,
            paymentMethodId: null,
        });
        await this.transferRepository.save(transfer);
        this.logger.log(`Transfer created: ${reference} for user: ${userId}`);
        return {
            referenceId: reference,
            amount: quote.amount,
            fromCurrency: quote.fromCurrency,
            toCurrency: quote.toCurrency,
            exchangeRate: quote.exchangeRate,
            transferFee: quote.transferFee,
            conversionFee: quote.conversionFee,
            totalFee: quote.totalFee,
            totalAmount: quote.totalAmount,
            status: common_enum_1.TransferStatus.PENDING,
        };
    }
    async getTransferByReference(reference, userId) {
        const query = { reference };
        if (userId) {
            query.senderId = userId;
        }
        const transfer = await this.transferRepository.findOne({
            where: query,
            relations: ['sender', 'recipientBank'],
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        return transfer;
    }
    async getTransferById(id) {
        const transfer = await this.transferRepository.findOne({
            where: { id },
            relations: ['sender', 'recipientBank'],
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        return transfer;
    }
    async getUserTransfers(userId, page = 1, limit = 10, status) {
        this.logger.log(`getUserTransfers called with userId: ${userId}, page: ${page}, limit: ${limit}, status: ${status}`);
        const skip = (page - 1) * limit;
        const queryBuilder = this.transferRepository
            .createQueryBuilder('transfer')
            .where('transfer.senderId = :userId', { userId })
            .leftJoinAndSelect('transfer.recipientBank', 'bank')
            .orderBy('transfer.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        if (status) {
            const normalizedStatus = status.toString().toUpperCase();
            queryBuilder.andWhere('transfer.status = :status', { status: normalizedStatus });
        }
        const [transfers, total] = await queryBuilder.getManyAndCount();
        this.logger.log(`Found ${total} transfers for user ${userId}`);
        return {
            data: transfers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async approveTransfer(transferId, adminId, notes) {
        const transfer = await this.getTransferById(transferId);
        if (transfer.status !== common_enum_1.TransferStatus.PENDING) {
            throw new common_1.BadRequestException(`Transfer cannot be approved. Current status: ${transfer.status}`);
        }
        transfer.status = common_enum_1.TransferStatus.COMPLETED;
        transfer.processedAt = new Date();
        transfer.completedAt = new Date();
        if (notes) {
            transfer.notes = transfer.notes ? `${transfer.notes}\n\nAdmin: ${notes}` : `Admin: ${notes}`;
        }
        await this.transferRepository.save(transfer);
        this.logger.log(`Transfer ${transferId} approved by admin ${adminId}`);
        return transfer;
    }
    async updateTransferPaymentMethod(transferId, paymentMethodId) {
        await this.transferRepository.update({ id: transferId }, { paymentMethodId });
    }
    generateReferenceId() {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `WMT-${timestamp}-${randomString}`;
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = TransfersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transfer_entity_1.Transfer)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        currency_service_1.CurrencyService,
        fee_service_1.FeeService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map