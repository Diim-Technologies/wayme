import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Decimal } from '@prisma/client/runtime/library';
import * as https from 'https';

interface ExchangeRateResponse {
  [key: string]: number;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  
  // Major currencies to track
  private readonly supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN'];
  
  constructor(private prisma: PrismaService) {}

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
        await this.prisma.exchangeRate.upsert({
          where: {
            fromCurrency_toCurrency: {
              fromCurrency,
              toCurrency,
            },
          },
          update: {
            rate: new Decimal(rate),
            buyRate: new Decimal(rate * 0.998), // Slightly lower buy rate
            sellRate: new Decimal(rate * 1.002), // Slightly higher sell rate
            lastUpdated: new Date(),
          },
          create: {
            fromCurrency,
            toCurrency,
            rate: new Decimal(rate),
            buyRate: new Decimal(rate * 0.998),
            sellRate: new Decimal(rate * 1.002),
            source: 'EXTERNAL_API',
          },
        });
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
        // Try reverse rate
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
          return new Decimal(1).div(rate);
        }

        // Fallback to static rates if no database rates found
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

      switch (type) {
        case 'buy':
          return exchangeRate.buyRate || exchangeRate.rate;
        case 'sell':
          return exchangeRate.sellRate || exchangeRate.rate;
        default:
          return exchangeRate.rate;
      }
    } catch (error) {
      this.logger.error(`Error getting exchange rate for ${fromCurrency}/${toCurrency}:`, error);
      
      // Fallback to static rates on error
      const fallbackRates: { [key: string]: number } = {
        'NGN_USD': 0.0012,
        'NGN_GBP': 0.001,
        'NGN_EUR': 0.0011,
        'USD_NGN': 830,
        'GBP_NGN': 1000,
        'EUR_NGN': 910,
      };

      const rateKey = `${fromCurrency}_${toCurrency}`;
      const rate = fallbackRates[rateKey] || 1;
      return new Decimal(rate);
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

  async manualRateUpdate(fromCurrency: string, toCurrency: string, rate: number, buyRate?: number, sellRate?: number) {
    return this.prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency,
          toCurrency,
        },
      },
      update: {
        rate: new Decimal(rate),
        buyRate: buyRate ? new Decimal(buyRate) : undefined,
        sellRate: sellRate ? new Decimal(sellRate) : undefined,
        source: 'MANUAL',
        lastUpdated: new Date(),
      },
      create: {
        fromCurrency,
        toCurrency,
        rate: new Decimal(rate),
        buyRate: buyRate ? new Decimal(buyRate) : undefined,
        sellRate: sellRate ? new Decimal(sellRate) : undefined,
        source: 'MANUAL',
      },
    });
  }
}