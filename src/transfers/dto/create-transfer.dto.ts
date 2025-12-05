import { IsNumber, IsString, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
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

    @ApiProperty({ example: 'John Doe', description: 'Recipient full name' })
    @IsString()
    recipientName: string;

    @ApiProperty({ description: 'Recipient bank UUID' })
    @IsUUID()
    recipientBankId: string;

    @ApiProperty({ example: '1234567890', description: 'Recipient account number' })
    @IsString()
    recipientAccount: string;

    @ApiProperty({ example: '+2348012345678', description: 'Recipient phone number' })
    @IsString()
    recipientPhone: string;

    @ApiProperty({ example: 'Family support', description: 'Transfer purpose' })
    @IsString()
    purpose: string;

    @ApiProperty({ example: 'Monthly allowance', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class ProceedToTransferResponseDto {
    @ApiProperty({ example: 'WMT-1733403411000-ABC123' })
    referenceId: string;

    @ApiProperty({ example: 1000 })
    amount: number;

    @ApiProperty({ example: 'NGN' })
    fromCurrency: string;

    @ApiProperty({ example: 'USD' })
    toCurrency: string;

    @ApiProperty({ example: 0.0012 })
    exchangeRate: number;

    @ApiProperty({ example: 50 })
    transferFee: number;

    @ApiProperty({ example: 5 })
    conversionFee: number;

    @ApiProperty({ example: 55 })
    totalFee: number;

    @ApiProperty({ example: 1055 })
    totalAmount: number;

    @ApiProperty({ example: 'PENDING' })
    status: string;
}

export class ApproveTransferDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
