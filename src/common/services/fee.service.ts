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
      // Try to find a specific fee configuration matching all criteria
      let feeConfig = await this.feeRepository.findOne({
        where: {
          type: FeeType.TRANSFER_FEE,
          isActive: true,
          currency: currency,
          transferType: transferType,
          paymentMethod: paymentMethod,
        },
      });

      // If no exact match, try finding by transferType only
      if (!feeConfig) {
        feeConfig = await this.feeRepository.findOne({
          where: {
            type: FeeType.TRANSFER_FEE,
            isActive: true,
            currency: currency,
            transferType: transferType,
            paymentMethod: null,
          },
        });
      }

      // If still no match, try finding by paymentMethod only
      if (!feeConfig) {
        feeConfig = await this.feeRepository.findOne({
          where: {
            type: FeeType.TRANSFER_FEE,
            isActive: true,
            currency: currency,
            transferType: null,
            paymentMethod: paymentMethod,
          },
        });
      }

      // If still no match, try finding a default configuration (both null)
      if (!feeConfig) {
        feeConfig = await this.feeRepository.findOne({
          where: {
            type: FeeType.TRANSFER_FEE,
            isActive: true,
            currency: currency,
            transferType: null,
            paymentMethod: null,
          },
        });
      }

      if (!feeConfig) {
        console.warn(`No fee configuration found for transferType: ${transferType}, paymentMethod: ${paymentMethod}, currency: ${currency}`);
        return new Decimal(0);
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
      return new Decimal(0);
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
    transferType?: string;
    paymentMethod?: string;
    currency?: string;
  }) {
    const feeConfig = this.feeRepository.create({
      name: data.name,
      type: data.type as FeeType,
      percentageRate: data.percentage,
      fixedAmount: data.fixedAmount,
      transferType: data.transferType,
      paymentMethod: data.paymentMethod,
      currency: data.currency || 'NGN',
    });

    return this.feeRepository.save(feeConfig);
  }

  async updateFeeConfiguration(id: string, data: {
    percentage?: number;
    fixedAmount?: number;
    transferType?: string;
    paymentMethod?: string;
    isActive?: boolean;
  }) {
    await this.feeRepository.update(
      { id },
      {
        percentageRate: data.percentage,
        fixedAmount: data.fixedAmount,
        transferType: data.transferType,
        paymentMethod: data.paymentMethod,
        isActive: data.isActive,
      }
    );

    return this.feeRepository.findOne({ where: { id } });
  }
}