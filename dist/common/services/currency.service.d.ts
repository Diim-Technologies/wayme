import { Repository } from 'typeorm';
import { Decimal } from 'decimal.js';
import { ExchangeRate } from '../../entities';
export declare class CurrencyService {
    private exchangeRateRepository;
    private readonly logger;
    private readonly supportedCurrencies;
    constructor(exchangeRateRepository: Repository<ExchangeRate>);
    updateExchangeRates(): Promise<void>;
    fetchAndUpdateRates(): Promise<void>;
    private fetchRatesForCurrency;
    private updateRatesInDatabase;
    getExchangeRate(fromCurrency: string, toCurrency: string, type?: 'buy' | 'sell' | 'mid'): Promise<Decimal>;
    getAllExchangeRates(): Promise<ExchangeRate[]>;
    manualRateUpdate(fromCurrency: string, toCurrency: string, rate: number, buyRate?: number, sellRate?: number): Promise<ExchangeRate>;
}
