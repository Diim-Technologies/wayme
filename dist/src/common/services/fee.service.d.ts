import { Repository } from 'typeorm';
import { Decimal } from 'decimal.js';
import { Fee } from '../../entities';
export declare class FeeService {
    private feeRepository;
    constructor(feeRepository: Repository<Fee>);
    calculateTransferFee(amount: Decimal, currency?: string): Promise<Decimal>;
    calculateCurrencyConversionFee(amount: Decimal, sourceCurrency: string, targetCurrency: string): Promise<Decimal>;
    getAllFeeConfigurations(): Promise<Fee[]>;
    createFeeConfiguration(data: {
        name: string;
        type: string;
        percentage?: number;
        fixedAmount?: number;
        currency?: string;
    }): Promise<Fee>;
    updateFeeConfiguration(id: string, data: {
        percentage?: number;
        fixedAmount?: number;
        isActive?: boolean;
    }): Promise<Fee>;
}
