import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Decimal } from 'decimal.js';
import { Fee } from '../../entities';
import { FeeType } from '../../enums/common.enum';

@Injectable()
export class FeeService {
  constructor(
    @InjectRepository(Fee)
    private feeRepository: Repository<Fee>,
  ) { }

  async calculateTransferFee(amount: Decimal, transferType: string = 'DOMESTIC', paymentMethod: string = 'BANK_TRANSFER', currency: string = 'NGN'): Promise<Decimal> {
    try {
      const feeConfig = await this.feeRepository.findOne({
        where: {
          type: FeeType.TRANSFER_FEE,
          isActive: true,
          currency: currency,
        },
      });

      if (!feeConfig) {
        // Fallback fee calculation
        return this.calculateFallbackTransferFee(amount, transferType, paymentMethod);
      }

      let calculatedFee = new Decimal(0);

      // Apply percentage fee
      if (feeConfig.percentageRate) {
        calculatedFee = amount.mul(feeConfig.percentageRate);
      }

      // Apply fixed fee
      if (feeConfig.fixedAmount) {
        calculatedFee = calculatedFee.add(feeConfig.fixedAmount);
      }



      return calculatedFee;
    } catch (error) {
      console.error('Error calculating transfer fee:', error);
      return this.calculateFallbackTransferFee(amount, transferType, paymentMethod);
    }
  }

  async calculateCurrencyConversionFee(amount: Decimal, sourceCurrency: string, targetCurrency: string): Promise<Decimal> {
    if (sourceCurrency === targetCurrency) {
      return new Decimal(0);
    }

    try {
      const feeConfig = await this.feeRepository.findOne({
        where: {
          type: FeeType.CURRENCY_CONVERSION_FEE,
          isActive: true,
          currency: sourceCurrency,
        },
      });

      if (!feeConfig) {
        // Default conversion fee: 0.5% of amount
        return amount.mul(0.005);
      }

      let calculatedFee = new Decimal(0);

      if (feeConfig.percentageRate) {
        calculatedFee = amount.mul(feeConfig.percentageRate);
      }

      if (feeConfig.fixedAmount) {
        calculatedFee = calculatedFee.add(feeConfig.fixedAmount);
      }



      return calculatedFee;
    } catch (error) {
      console.error('Error calculating conversion fee:', error);
      return amount.mul(0.005); // 0.5% fallback
    }
  }

  private calculateFallbackTransferFee(amount: Decimal, transferType: string, paymentMethod: string): Decimal {
    // Fallback fee structure
    let feeRate = 0.025; // 2.5% base rate


    // Adjust based on transfer type
    if (transferType === 'INTERNATIONAL') {
      feeRate = 0.035; // 3.5% for international

    }

    // Adjust based on payment method
    if (paymentMethod === 'CARD') {
      feeRate += 0.01; // Additional 1% for card payments
    }

    let fee = amount.mul(feeRate);



    return fee;
  }

  async getAllFeeConfigurations() {
    return this.feeRepository.find({
      where: { isActive: true },
      order: { type: 'ASC' },
    });
  }

  async createFeeConfiguration(data: {
    name: string;
    type: string;
    percentage?: number;
    fixedAmount?: number;

    currency?: string;
  }) {
    const feeConfig = this.feeRepository.create({
      name: data.name,
      type: data.type as FeeType,
      percentageRate: data.percentage,
      fixedAmount: data.fixedAmount,

      currency: data.currency || 'NGN',
    });

    return this.feeRepository.save(feeConfig);
  }

  async updateFeeConfiguration(id: string, data: {
    percentage?: number;
    fixedAmount?: number;

    isActive?: boolean;
  }) {
    await this.feeRepository.update(
      { id },
      {
        percentageRate: data.percentage,
        fixedAmount: data.fixedAmount,

        isActive: data.isActive,
      }
    );

    return this.feeRepository.findOne({ where: { id } });
  }
}