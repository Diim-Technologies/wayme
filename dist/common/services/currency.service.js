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
var CurrencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const entities_1 = require("../../entities");
let CurrencyService = CurrencyService_1 = class CurrencyService {
    constructor(exchangeRateRepository) {
        this.exchangeRateRepository = exchangeRateRepository;
        this.logger = new common_1.Logger(CurrencyService_1.name);
        this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'];
    }
    async updateExchangeRates() {
        this.logger.log('Automatic exchange rate updates are disabled. Please use admin panel to set rates manually.');
        return;
    }
    async fetchAndUpdateRates() {
        this.logger.log('Exchange rate fetching from external API is disabled. Using admin-configured rates only.');
        return;
    }
    async getExchangeRate(fromCurrency, toCurrency, type = 'mid') {
        if (fromCurrency === toCurrency) {
            return new decimal_js_1.Decimal(1);
        }
        try {
            const exchangeRate = await this.exchangeRateRepository.findOne({
                where: { fromCurrency, toCurrency, isActive: true },
            });
            if (!exchangeRate) {
                const reverseRate = await this.exchangeRateRepository.findOne({
                    where: { fromCurrency: toCurrency, toCurrency: fromCurrency, isActive: true },
                });
                if (reverseRate) {
                    return new decimal_js_1.Decimal(1).div(reverseRate.rate);
                }
                this.logger.warn(`No exchange rate found for ${fromCurrency}/${toCurrency}. Using fallback rate. Please set rate via admin panel.`);
                const fallbackRates = {
                    'NGN_USD': 0.0012,
                    'NGN_GBP': 0.001,
                    'NGN_EUR': 0.0011,
                    'USD_NGN': 830,
                    'GBP_NGN': 1000,
                    'EUR_NGN': 910,
                };
                const rateKey = `${fromCurrency}_${toCurrency}`;
                const fallbackRate = fallbackRates[rateKey] || 1;
                return new decimal_js_1.Decimal(fallbackRate);
            }
            return new decimal_js_1.Decimal(exchangeRate.rate);
        }
        catch (error) {
            this.logger.error(`Error getting exchange rate for ${fromCurrency}/${toCurrency}:`, error);
            const fallbackRates = {
                'NGN_USD': 0.0012,
                'USD_NGN': 830,
            };
            const rateKey = `${fromCurrency}_${toCurrency}`;
            const rate = fallbackRates[rateKey] || 1;
            return new decimal_js_1.Decimal(rate);
        }
    }
    async getAllExchangeRates() {
        return this.exchangeRateRepository.find({
            where: { isActive: true },
            order: { fromCurrency: 'ASC', toCurrency: 'ASC' },
        });
    }
    async manualRateUpdate(fromCurrency, toCurrency, rate, buyRate, sellRate) {
        let exchangeRate = await this.exchangeRateRepository.findOne({
            where: { fromCurrency, toCurrency },
        });
        if (exchangeRate) {
            await this.exchangeRateRepository.update({ fromCurrency, toCurrency }, {
                rate: rate,
                provider: 'MANUAL',
                updatedAt: new Date(),
            });
            return this.exchangeRateRepository.findOne({ where: { fromCurrency, toCurrency } });
        }
        else {
            exchangeRate = this.exchangeRateRepository.create({
                fromCurrency,
                toCurrency,
                rate: rate,
                provider: 'MANUAL',
            });
            return this.exchangeRateRepository.save(exchangeRate);
        }
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = CurrencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ExchangeRate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map