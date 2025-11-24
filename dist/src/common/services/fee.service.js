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
exports.FeeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
const client_1 = require("@prisma/client");
let FeeService = class FeeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateTransferFee(amount, transferType, paymentMethodType, currency = 'NGN') {
        const applicableTypes = [transferType.toUpperCase(), paymentMethodType.toUpperCase()];
        try {
            const feeConfig = await this.prisma.feeConfiguration.findFirst({
                where: {
                    type: 'TRANSFER_FEE',
                    isActive: true,
                    currency,
                    OR: applicableTypes.map(type => ({
                        applicableTo: {
                            contains: type
                        }
                    }))
                },
                orderBy: { createdAt: 'desc' },
            });
            if (!feeConfig) {
                return this.getDefaultTransferFee(amount);
            }
            let feeAmount = new library_1.Decimal(0);
            if (feeConfig.percentage) {
                feeAmount = amount.mul(feeConfig.percentage.div(100));
            }
            if (feeConfig.fixedAmount) {
                feeAmount = feeAmount.add(feeConfig.fixedAmount);
            }
            if (feeConfig.minimumFee && feeAmount.lt(feeConfig.minimumFee)) {
                feeAmount = feeConfig.minimumFee;
            }
            if (feeConfig.maximumFee && feeAmount.gt(feeConfig.maximumFee)) {
                feeAmount = feeConfig.maximumFee;
            }
            return feeAmount;
        }
        catch (error) {
            return this.getDefaultTransferFee(amount);
        }
    }
    async calculateCurrencyConversionFee(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return new library_1.Decimal(0);
        }
        try {
            const feeConfig = await this.prisma.feeConfiguration.findFirst({
                where: {
                    type: 'CURRENCY_CONVERSION_FEE',
                    isActive: true,
                    OR: [
                        { currency: fromCurrency },
                        { currency: 'ALL' },
                    ],
                },
                orderBy: { createdAt: 'desc' },
            });
            if (!feeConfig) {
                return amount.mul(0.005);
            }
            let feeAmount = new library_1.Decimal(0);
            if (feeConfig.percentage) {
                feeAmount = amount.mul(feeConfig.percentage.div(100));
            }
            if (feeConfig.fixedAmount) {
                feeAmount = feeAmount.add(feeConfig.fixedAmount);
            }
            if (feeConfig.minimumFee && feeAmount.lt(feeConfig.minimumFee)) {
                feeAmount = feeConfig.minimumFee;
            }
            if (feeConfig.maximumFee && feeAmount.gt(feeConfig.maximumFee)) {
                feeAmount = feeConfig.maximumFee;
            }
            return feeAmount;
        }
        catch (error) {
            return amount.mul(0.005);
        }
    }
    async getAllFeeConfigurations() {
        return this.prisma.feeConfiguration.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createFeeConfiguration(data) {
        return this.prisma.feeConfiguration.create({
            data: {
                name: data.name,
                type: client_1.FeeType[data.type],
                percentage: data.percentage ? new library_1.Decimal(data.percentage) : undefined,
                fixedAmount: data.fixedAmount ? new library_1.Decimal(data.fixedAmount) : undefined,
                minimumFee: data.minimumFee ? new library_1.Decimal(data.minimumFee) : undefined,
                maximumFee: data.maximumFee ? new library_1.Decimal(data.maximumFee) : undefined,
                currency: data.currency,
                applicableTo: data.applicableTo?.join(',')
            },
        });
    }
    async updateFeeConfiguration(id, data) {
        return this.prisma.feeConfiguration.update({
            where: { id },
            data: {
                ...data,
                type: data.type ? client_1.FeeType[data.type] : undefined,
                percentage: data.percentage !== undefined ? new library_1.Decimal(data.percentage) : undefined,
                fixedAmount: data.fixedAmount !== undefined ? new library_1.Decimal(data.fixedAmount) : undefined,
                minimumFee: data.minimumFee !== undefined ? new library_1.Decimal(data.minimumFee) : undefined,
                maximumFee: data.maximumFee !== undefined ? new library_1.Decimal(data.maximumFee) : undefined,
                applicableTo: data.applicableTo ? data.applicableTo.join(',') : undefined,
            },
        });
    }
    getDefaultTransferFee(amount) {
        const percentageFee = amount.mul(0.025);
        return library_1.Decimal.max(new library_1.Decimal(50), library_1.Decimal.min(new library_1.Decimal(500), percentageFee));
    }
};
exports.FeeService = FeeService;
exports.FeeService = FeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeeService);
//# sourceMappingURL=fee.service.js.map