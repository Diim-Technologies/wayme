import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from 'decimal.js';
import { ExchangeRate } from '../../entities';
import * as https from 'https';

interface ExchangeRateResponse {
  [key: string]: number;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  
  // Major currencies to track
  private readonly supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'];
  
  constructor(
    @InjectRepository(ExchangeRate)
    private exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async updateExchangeRates() {
    this.logger.log('Starting daily exchange rate update...');
    
    try {
      await this.fetchAndUpdateRates();
      this.logger.log('Exchange rates updated successfully');
    } catch (error) {
      this.logger.error('Failed to update exchange rates:', error);
    }
  }

  async fetchAndUpdateRates() {
    // Using a free API service (you can replace with your preferred provider)
    const apiKey = process.env.EXCHANGE_RATE_API_KEY || 'demo_key';
    const baseUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest`;

    for (const baseCurrency of this.supportedCurrencies) {
      try {
        const rates = await this.fetchRatesForCurrency(baseUrl, baseCurrency);
        await this.updateRatesInDatabase(baseCurrency, rates);
      } catch (error) {
        this.logger.error(`Failed to fetch rates for ${baseCurrency}:`, error);
      }
    }
  }

  private async fetchRatesForCurrency(baseUrl: string, baseCurrency: string): Promise<ExchangeRateResponse> {
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
            } else {
              reject(new Error(`API Error: ${parsed.error_type}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  private async updateRatesInDatabase(fromCurrency: string, rates: ExchangeRateResponse) {
    for (const [toCurrency, rate] of Object.entries(rates)) {
      if (!this.supportedCurrencies.includes(toCurrency)) continue;
      
      try {
        // Check if rate exists
        let exchangeRate = await this.exchangeRateRepository.findOne({
          where: { fromCurrency, toCurrency },
        });

        if (exchangeRate) {
          // Update existing rate
          await this.exchangeRateRepository.update(
            { fromCurrency, toCurrency },
            {
              rate: rate,
              updatedAt: new Date(),
            }
          );
        } else {
          // Create new rate
          exchangeRate = this.exchangeRateRepository.create({
            fromCurrency,
            toCurrency,
            rate: rate,
            provider: 'EXTERNAL_API',
          });
          await this.exchangeRateRepository.save(exchangeRate);
        }
        
        this.logger.log(`Rate updated: ${fromCurrency}/${toCurrency} = ${rate}`);
      } catch (error) {
        this.logger.error(`Failed to update ${fromCurrency}/${toCurrency} rate:`, error);
      }
    }
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

        // Fallback to static rates
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