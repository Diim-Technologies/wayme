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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const entities_1 = require("../../entities");
const common_enum_1 = require("../../enums/common.enum");
let FeeService = class FeeService {
    constructor(feeRepository) {
        this.feeRepository = feeRepository;
    }
    async calculateTransferFee(amount, transferType = 'DOMESTIC', paymentMethod = 'BANK_TRANSFER', currency = 'NGN') {
        try {
            const feeConfig = await this.feeRepository.findOne({
                where: {
                    type: common_enum_1.FeeType.TRANSFER_FEE,
                    isActive: true,
                },
            });
            if (!feeConfig) {
                return this.calculateFallbackTransferFee(amount, transferType, paymentMethod);
            }
            let calculatedFee = new decimal_js_1.Decimal(0);
            if (feeConfig.percentageRate) {
                calculatedFee = amount.mul(feeConfig.percentageRate);
            }
            if (feeConfig.fixedAmount) {
                calculatedFee = calculatedFee.add(feeConfig.fixedAmount);
            }
            if (feeConfig.minimumAmount && calculatedFee.lt(feeConfig.minimumAmount)) {
                calculatedFee = new decimal_js_1.Decimal(feeConfig.minimumAmount);
            }
            if (feeConfig.maximumAmount && calculatedFee.gt(feeConfig.maximumAmount)) {
                calculatedFee = new decimal_js_1.Decimal(feeConfig.maximumAmount);
            }
            return calculatedFee;
        }
        catch (error) {
            console.error('Error calculating transfer fee:', error);
            return this.calculateFallbackTransferFee(amount, transferType, paymentMethod);
        }
    }
    async calculateCurrencyConversionFee(amount, sourceCurrency, targetCurrency) {
        if (sourceCurrency === targetCurrency) {
            return new decimal_js_1.Decimal(0);
        }
        try {
            const feeConfig = await this.feeRepository.findOne({
                where: {
                    type: common_enum_1.FeeType.CURRENCY_CONVERSION_FEE,
                    isActive: true,
                },
            });
            if (!feeConfig) {
                return amount.mul(0.005);
            }
            let calculatedFee = new decimal_js_1.Decimal(0);
            if (feeConfig.percentageRate) {
                calculatedFee = amount.mul(feeConfig.percentageRate);
            }
            if (feeConfig.fixedAmount) {
                calculatedFee = calculatedFee.add(feeConfig.fixedAmount);
            }
            if (feeConfig.minimumAmount && calculatedFee.lt(feeConfig.minimumAmount)) {
                calculatedFee = new decimal_js_1.Decimal(feeConfig.minimumAmount);
            }
            if (feeConfig.maximumAmount && calculatedFee.gt(feeConfig.maximumAmount)) {
                calculatedFee = new decimal_js_1.Decimal(feeConfig.maximumAmount);
            }
            return calculatedFee;
        }
        catch (error) {
            console.error('Error calculating conversion fee:', error);
            return amount.mul(0.005);
        }
    }
    calculateFallbackTransferFee(amount, transferType, paymentMethod) {
        let feeRate = 0.025;
        let minimumFee = 50;
        let maximumFee = 500;
        if (transferType === 'INTERNATIONAL') {
            feeRate = 0.035;
            minimumFee = 100;
            maximumFee = 1000;
        }
        if (paymentMethod === 'CARD') {
            feeRate += 0.01;
        }
        let fee = amount.mul(feeRate);
        if (fee.lt(minimumFee)) {
            fee = new decimal_js_1.Decimal(minimumFee);
        }
        else if (fee.gt(maximumFee)) {
            fee = new decimal_js_1.Decimal(maximumFee);
        }
        return fee;
    }
    async getAllFeeConfigurations() {
        return this.feeRepository.find({
            where: { isActive: true },
            order: { type: 'ASC' },
        });
    }
    async createFeeConfiguration(data) {
        const feeConfig = this.feeRepository.create({
            name: data.name,
            type: data.type,
            percentageRate: data.percentage,
            fixedAmount: data.fixedAmount,
            minimumAmount: data.minimumFee,
            maximumAmount: data.maximumFee,
            currency: data.currency || 'NGN',
        });
        return this.feeRepository.save(feeConfig);
    }
    async updateFeeConfiguration(id, data) {
        await this.feeRepository.update({ id }, {
            percentageRate: data.percentage,
            fixedAmount: data.fixedAmount,
            minimumAmount: data.minimumFee,
            maximumAmount: data.maximumFee,
            isActive: data.isActive,
        });
        return this.feeRepository.findOne({ where: { id } });
    }
};
exports.FeeService = FeeService;
exports.FeeService = FeeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Fee)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FeeService);
//# sourceMappingURL=fee.service.js.map