import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferQuoteDto {
    @ApiProperty({ example: 1000, description: 'Amount to transfer' })
    @IsNumber()
    @Min(1)
    amount: number;

    @ApiProperty({ example: 'NGN', description: 'Source currency code' })
    @IsString()
    fromCurrency: string;

    @ApiProperty({ example: 'USD', description: 'Target currency code' })
    @IsString()
    toCurrency: string;
}

export class TransferQuoteResponseDto {
    @ApiProperty({ example: 1000 })
    amount: number;

    @ApiProperty({ example: 'NGN' })
    fromCurrency: string;

    @ApiProperty({ example: 'USD' })
    toCurrency: string;

    @ApiProperty({ example: 0.0012, description: 'Exchange rate' })
    exchangeRate: number;

    @ApiProperty({ example: 1.2, description: 'Amount in target currency' })
    convertedAmount: number;

    @ApiProperty({ example: 50, description: 'Transfer fee' })
    transferFee: number;

    @ApiProperty({ example: 5, description: 'Currency conversion fee' })
    conversionFee: number;

    @ApiProperty({ example: 55, description: 'Total fees' })
    totalFee: number;

    @ApiProperty({ example: 1055, description: 'Total amount to pay (amount + fees)' })
    totalAmount: number;

    @ApiProperty({ description: 'Quote expiration time (15 minutes)' })
    expiresAt: Date;
}
