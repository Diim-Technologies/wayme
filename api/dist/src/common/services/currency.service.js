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
var CurrencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const library_1 = require("@prisma/client/runtime/library");
const https = require("https");
let CurrencyService = CurrencyService_1 = class CurrencyService {
    constructor(prisma) {
        this.prisma = prisma;
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
                await this.prisma.exchangeRate.upsert({
                    where: {
                        fromCurrency_toCurrency: {
                            fromCurrency,
                            toCurrency,
                        },
                    },
                    update: {
                        rate: new library_1.Decimal(rate),
                        buyRate: new library_1.Decimal(rate * 0.998),
                        sellRate: new library_1.Decimal(rate * 1.002),
                        lastUpdated: new Date(),
                    },
                    create: {
                        fromCurrency,
                        toCurrency,
                        rate: new library_1.Decimal(rate),
                        buyRate: new library_1.Decimal(rate * 0.998),
                        sellRate: new library_1.Decimal(rate * 1.002),
                        source: 'EXTERNAL_API',
                    },
                });
                this.logger.log(`Rate updated: ${fromCurrency}/${toCurrency} = ${rate}`);
            }
            catch (error) {
                this.logger.error(`Failed to update ${fromCurrency}/${toCurrency} rate:`, error);
            }
        }
    }
    async getExchangeRate(fromCurrency, toCurrency, type = 'mid') {
        if (fromCurrency === toCurrency) {
            return new library_1.Decimal(1);
        }
        try {
            const exchangeRate = await this.prisma.exchangeRate.findUnique({
                where: {
                    fromCurrency_toCurrency: {
                        fromCurrency,
                        toCurrency,
                    },
                    isActive: true,
                },
            });
            if (!exchangeRate) {
                const reverseRate = await this.prisma.exchangeRate.findUnique({
                    where: {
                        fromCurrency_toCurrency: {
                            fromCurrency: toCurrency,
                            toCurrency: fromCurrency,
                        },
                        isActive: true,
                    },
                });
                if (reverseRate) {
                    const rate = type === 'buy' ? reverseRate.sellRate || reverseRate.rate
                        : type === 'sell' ? reverseRate.buyRate || reverseRate.rate
                            : reverseRate.rate;
                    return new library_1.Decimal(1).div(rate);
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
                return new library_1.Decimal(fallbackRate);
            }
            switch (type) {
                case 'buy':
                    return exchangeRate.buyRate || exchangeRate.rate;
                case 'sell':
                    return exchangeRate.sellRate || exchangeRate.rate;
                default:
                    return exchangeRate.rate;
            }
        }
        catch (error) {
            this.logger.error(`Error getting exchange rate for ${fromCurrency}/${toCurrency}:`, error);
            const fallbackRates = {
                'NGN_USD': 0.0012,
                'NGN_GBP': 0.001,
                'NGN_EUR': 0.0011,
                'USD_NGN': 830,
                'GBP_NGN': 1000,
                'EUR_NGN': 910,
            };
            const rateKey = `${fromCurrency}_${toCurrency}`;
            const rate = fallbackRates[rateKey] || 1;
            return new library_1.Decimal(rate);
        }
    }
    async getAllExchangeRates() {
        return this.prisma.exchangeRate.findMany({
            where: { isActive: true },
            orderBy: [
                { fromCurrency: 'asc' },
                { toCurrency: 'asc' },
            ],
        });
    }
    async manualRateUpdate(fromCurrency, toCurrency, rate, buyRate, sellRate) {
        return this.prisma.exchangeRate.upsert({
            where: {
                fromCurrency_toCurrency: {
                    fromCurrency,
                    toCurrency,
                },
            },
            update: {
                rate: new library_1.Decimal(rate),
                buyRate: buyRate ? new library_1.Decimal(buyRate) : undefined,
                sellRate: sellRate ? new library_1.Decimal(sellRate) : undefined,
                source: 'MANUAL',
                lastUpdated: new Date(),
            },
            create: {
                fromCurrency,
                toCurrency,
                rate: new library_1.Decimal(rate),
                buyRate: buyRate ? new library_1.Decimal(buyRate) : undefined,
                sellRate: sellRate ? new library_1.Decimal(sellRate) : undefined,
                source: 'MANUAL',
            },
        });
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map