import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Decimal } from 'decimal.js';
import { ExchangeRate } from '../../entities';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  // Major currencies to track
  private readonly supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'];

  constructor(
    @InjectRepository(ExchangeRate)
    private exchangeRateRepository: Repository<ExchangeRate>,
  ) { }

  // Automatic exchange rate updates disabled - using admin-set rates only
  // @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async updateExchangeRates() {
    this.logger.log('Automatic exchange rate updates are disabled. Please use admin panel to set rates manually.');
    return;
  }

  async fetchAndUpdateRates() {
    // Automatic exchange rate fetching is disabled
    // All exchange rates must be set manually by admin using the manualRateUpdate method
    this.logger.log('Exchange rate fetching from external API is disabled. Using admin-configured rates only.');
    return;
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string, type: 'buy' | 'sell' | 'mid' = 'mid') {
    if (fromCurrency === toCurrency) {
      return new Decimal(1);
    }

    try {
      const exchangeRate = await this.exchangeRateRepository.findOne({
        where: { fromCurrency, toCurrency, isActive: true },
      });

      if (!exchangeRate) {
        // Try reverse rate
        const reverseRate = await this.exchangeRateRepository.findOne({
          where: { fromCurrency: toCurrency, toCurrency: fromCurrency, isActive: true },
        });

        if (reverseRate) {
          return new Decimal(1).div(reverseRate.rate);
        }

        // Fallback to static rates - these should be replaced with admin-set rates
        this.logger.warn(`No exchange rate found for ${fromCurrency}/${toCurrency}. Using fallback rate. Please set rate via admin panel.`);
        const fallbackRates: { [key: string]: number } = {
          'NGN_USD': 0.0012,
          'NGN_GBP': 0.001,
          'NGN_EUR': 0.0011,
          'USD_NGN': 830,
          'GBP_NGN': 1000,
          'EUR_NGN': 910,
        };

        const rateKey = `${fromCurrency}_${toCurrency}`;
        const fallbackRate = fallbackRates[rateKey] || 1;
        return new Decimal(fallbackRate);
      }

      return new Decimal(exchangeRate.rate);
    } catch (error) {
      this.logger.error(`Error getting exchange rate for ${fromCurrency}/${toCurrency}:`, error);

      // Fallback to static rates on error
      const fallbackRates: { [key: string]: number } = {
        'NGN_USD': 0.0012,
        'USD_NGN': 830,
      };

      const rateKey = `${fromCurrency}_${toCurrency}`;
      const rate = fallbackRates[rateKey] || 1;
      return new Decimal(rate);
    }
  }

  async getAllExchangeRates() {
    return this.exchangeRateRepository.find({
      where: { isActive: true },
      order: { fromCurrency: 'ASC', toCurrency: 'ASC' },
    });
  }

  async manualRateUpdate(fromCurrency: string, toCurrency: string, rate: number, buyRate?: number, sellRate?: number) {
    // Check if rate exists
    let exchangeRate = await this.exchangeRateRepository.findOne({
      where: { fromCurrency, toCurrency },
    });

    if (exchangeRate) {
      await this.exchangeRateRepository.update(
        { fromCurrency, toCurrency },
        {
          rate: rate,
          provider: 'MANUAL',
          updatedAt: new Date(),
        }
      );
      return this.exchangeRateRepository.findOne({ where: { fromCurrency, toCurrency } });
    } else {
      exchangeRate = this.exchangeRateRepository.create({
        fromCurrency,
        toCurrency,
        rate: rate,
        provider: 'MANUAL',
      });
      return this.exchangeRateRepository.save(exchangeRate);
    }
  }
}