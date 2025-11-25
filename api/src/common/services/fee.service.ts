import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { FeeType, Prisma } from '@prisma/client';

@Injectable()
export class FeeService {
  constructor(private prisma: PrismaService) {}

  async calculateTransferFee(amount: Decimal, transferType: string, paymentMethodType: string, currency = 'NGN') {
    // Determine applicable fee configurations
    const applicableTypes = [transferType.toUpperCase(), paymentMethodType.toUpperCase()];
    
    try {
      const feeConfig = await this.prisma.feeConfiguration.findFirst({
        where: {
          type: 'TRANSFER_FEE',
          isActive: true,
          currency,
          OR: applicableTypes.map(type => ({
            applicableTo: {
              contains: type
            }
          }))
        },
        orderBy: { createdAt: 'desc' }, // Get the most recent config
      });

      if (!feeConfig) {
        // Fallback to default fee calculation
        return this.getDefaultTransferFee(amount);
      }

      let feeAmount = new Decimal(0);

      // Calculate percentage fee if configured
      if (feeConfig.percentage) {
        feeAmount = amount.mul(feeConfig.percentage.div(100));
      }

      // Add fixed amount if configured
      if (feeConfig.fixedAmount) {
        feeAmount = feeAmount.add(feeConfig.fixedAmount);
      }

      // Apply minimum fee if configured
      if (feeConfig.minimumFee && feeAmount.lt(feeConfig.minimumFee)) {
        feeAmount = feeConfig.minimumFee;
      }

      // Apply maximum fee if configured
      if (feeConfig.maximumFee && feeAmount.gt(feeConfig.maximumFee)) {
        feeAmount = feeConfig.maximumFee;
      }

      return feeAmount;
    } catch (error) {
      // Fallback to default fee calculation on error
      return this.getDefaultTransferFee(amount);
    }
  }

  async calculateCurrencyConversionFee(amount: Decimal, fromCurrency: string, toCurrency: string) {
    if (fromCurrency === toCurrency) {
      return new Decimal(0);
    }

    try {
      const feeConfig = await this.prisma.feeConfiguration.findFirst({
        where: {
          type: 'CURRENCY_CONVERSION_FEE',
          isActive: true,
          OR: [
            { currency: fromCurrency },
            { currency: 'ALL' }, // Universal currency conversion fee
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!feeConfig) {
        // Default 0.5% conversion fee
        return amount.mul(0.005);
      }

      let feeAmount = new Decimal(0);

      if (feeConfig.percentage) {
        feeAmount = amount.mul(feeConfig.percentage.div(100));
      }

      if (feeConfig.fixedAmount) {
        feeAmount = feeAmount.add(feeConfig.fixedAmount);
      }

      if (feeConfig.minimumFee && feeAmount.lt(feeConfig.minimumFee)) {
        feeAmount = feeConfig.minimumFee;
      }

      if (feeConfig.maximumFee && feeAmount.gt(feeConfig.maximumFee)) {
        feeAmount = feeConfig.maximumFee;
      }

      return feeAmount;
    } catch (error) {
      // Default 0.5% conversion fee on error
      return amount.mul(0.005);
    }
  }

  async getAllFeeConfigurations() {
    return this.prisma.feeConfiguration.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFeeConfiguration(data: {
    name: string;
    type: FeeType | string;  // allow string from API
    percentage?: number;
    fixedAmount?: number;
    minimumFee?: number;
    maximumFee?: number;
    currency?: string;
    applicableTo?: string[];
  }) {
    return this.prisma.feeConfiguration.create({
      data: {
        name: data.name,
        type: FeeType[data.type as keyof typeof FeeType],   // 🔥 Convert string → enum
        percentage: data.percentage ? new Decimal(data.percentage) : undefined,
        fixedAmount: data.fixedAmount ? new Decimal(data.fixedAmount) : undefined,
        minimumFee: data.minimumFee ? new Decimal(data.minimumFee) : undefined,
        maximumFee: data.maximumFee ? new Decimal(data.maximumFee) : undefined,
        currency: data.currency,
        applicableTo: data.applicableTo?.join(',')
      },
    });
  }
  

  async updateFeeConfiguration(id: string, data: {
    percentage?: number;
    fixedAmount?: number;
    minimumFee?: number;
    maximumFee?: number;
    applicableTo?: string[];
    isActive?: boolean;
    type?: FeeType | string;

  }) {
    return this.prisma.feeConfiguration.update({
      where: { id },
      data: {
        ...data,
        type: data.type ? FeeType[data.type as keyof typeof FeeType] : undefined,

        percentage: data.percentage !== undefined ? new Decimal(data.percentage) : undefined,
        fixedAmount: data.fixedAmount !== undefined ? new Decimal(data.fixedAmount) : undefined,
        minimumFee: data.minimumFee !== undefined ? new Decimal(data.minimumFee) : undefined,
        maximumFee: data.maximumFee !== undefined ? new Decimal(data.maximumFee) : undefined,
        applicableTo: data.applicableTo ? data.applicableTo.join(',') : undefined, // Convert array to comma-separated string
      },
    });
  }

  private getDefaultTransferFee(amount: Decimal): Decimal {
    // Default fee: 2.5% with minimum 50 NGN and maximum 500 NGN
    const percentageFee = amount.mul(0.025);
    return Decimal.max(new Decimal(50), Decimal.min(new Decimal(500), percentageFee));
  }
}