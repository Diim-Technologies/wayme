import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { FeeType, Prisma } from '@prisma/client';
export declare class FeeService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateTransferFee(amount: Decimal, transferType: string, paymentMethodType: string, currency?: string): Promise<Decimal>;
    calculateCurrencyConversionFee(amount: Decimal, fromCurrency: string, toCurrency: string): Promise<Decimal>;
    getAllFeeConfigurations(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.FeeType;
        percentage: Prisma.Decimal | null;
        fixedAmount: Prisma.Decimal | null;
        minimumFee: Prisma.Decimal | null;
        maximumFee: Prisma.Decimal | null;
        currency: string;
        applicableTo: string | null;
    }[]>;
    createFeeConfiguration(data: {
        name: string;
        type: FeeType | string;
        percentage?: number;
        fixedAmount?: number;
        minimumFee?: number;
        maximumFee?: number;
        currency?: string;
        applicableTo?: string[];
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.FeeType;
        percentage: Prisma.Decimal | null;
        fixedAmount: Prisma.Decimal | null;
        minimumFee: Prisma.Decimal | null;
        maximumFee: Prisma.Decimal | null;
        currency: string;
        applicableTo: string | null;
    }>;
    updateFeeConfiguration(id: string, data: {
        percentage?: number;
        fixedAmount?: number;
        minimumFee?: number;
        maximumFee?: number;
        applicableTo?: string[];
        isActive?: boolean;
        type?: FeeType | string;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.FeeType;
        percentage: Prisma.Decimal | null;
        fixedAmount: Prisma.Decimal | null;
        minimumFee: Prisma.Decimal | null;
        maximumFee: Prisma.Decimal | null;
        currency: string;
        applicableTo: string | null;
    }>;
    private getDefaultTransferFee;
}
