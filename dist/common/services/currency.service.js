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
const schedule_1 = require("@nestjs/schedule");
const decimal_js_1 = require("decimal.js");
const entities_1 = require("../../entities");
const https = require("https");
let CurrencyService = CurrencyService_1 = class CurrencyService {
    constructor(exchangeRateRepository) {
        this.exchangeRateRepository = exchangeRateRepository;
        this.logger = new common_1.Logger(CurrencyService_1.name);
        this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'];
    }
    async updateExchangeRates() {
        this.logger.log('Starting daily exchange rate update...');
        try {
            await this.fetchAndUpdateRates();
            this.logger.log('Exchange rates updated successfully');
        }
        catch (error) {
            this.logger.error('Failed to update exchange rates:', error);
        }
    }
    async fetchAndUpdateRates() {
        const apiKey = process.env.EXCHANGE_RATE_API_KEY || 'demo_key';
        const baseUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest`;
        for (const baseCurrency of this.supportedCurrencies) {
            try {
                const rates = await this.fetchRatesForCurrency(baseUrl, baseCurrency);
                await this.updateRatesInDatabase(baseCurrency, rates);
            }
            catch (error) {
                this.logger.error(`Failed to fetch rates for ${baseCurrency}:`, error);
            }
        }
    }
    async fetchRatesForCurrency(baseUrl, baseCurrency) {
        return new Promise((resolve, reject) => {
            const url = `${baseUrl}/${baseCurrency}`;
            https.get(url, (response) => {
                let data = '';
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.result === 'success') {
                            resolve(parsed.conversion_rates);
                        }
                        else {
                            reject(new Error(`API Error: ${parsed.error_type}`));
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }
    async updateRatesInDatabase(fromCurrency, rates) {
        for (const [toCurrency, rate] of Object.entries(rates)) {
            if (!this.supportedCurrencies.includes(toCurrency))
                continue;
            try {
                let exchangeRate = await this.exchangeRateRepository.findOne({
                    where: { fromCurrency, toCurrency },
                });
                if (exchangeRate) {
                    await this.exchangeRateRepository.update({ fromCurrency, toCurrency }, {
                        rate: rate,
                        updatedAt: new Date(),
                    });
                }
                else {
                    exchangeRate = this.exchangeRateRepository.create({
                        fromCurrency,
                        toCurrency,
                        rate: rate,
                        provider: 'EXTERNAL_API',
                    });
                    await this.exchangeRateRepository.save(exchangeRate);
                }
                this.logger.log(`Rate updated: ${fromCurrency}/${toCurrency} = ${rate}`);
            }
            catch (error) {
                this.logger.error(`Failed to update ${fromCurrency}/${toCurrency} rate:`, error);
            }
        }
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
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurrencyService.prototype, "updateExchangeRates", null);
exports.CurrencyService = CurrencyService = CurrencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ExchangeRate)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map