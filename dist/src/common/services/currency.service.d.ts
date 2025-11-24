import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class CurrencyService {
    private prisma;
    private readonly logger;
    private readonly supportedCurrencies;
    constructor(prisma: PrismaService);
    updateExchangeRates(): Promise<void>;
    fetchAndUpdateRates(): Promise<void>;
    private fetchRatesForCurrency;
    private updateRatesInDatabase;
    getExchangeRate(fromCurrency: string, toCurrency: string, type?: 'buy' | 'sell' | 'mid'): Promise<Decimal>;
    getAllExchangeRates(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        toCurrency: string;
        rate: Decimal;
        fromCurrency: string;
        buyRate: Decimal | null;
        sellRate: Decimal | null;
        source: string;
        lastUpdated: Date;
    }[]>;
    manualRateUpdate(fromCurrency: string, toCurrency: string, rate: number, buyRate?: number, sellRate?: number): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        toCurrency: string;
        rate: Decimal;
        fromCurrency: string;
        buyRate: Decimal | null;
        sellRate: Decimal | null;
        source: string;
        lastUpdated: Date;
    }>;
}
