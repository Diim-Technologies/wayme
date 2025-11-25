import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTransferDto {
  @ApiProperty({ example: 10000, description: 'Amount to transfer in smallest currency unit (kobo for NGN)' })
  @IsNumber()
  @Min(100) // Minimum 1 NGN
  @Transform(({ value }) => Number(value))
  amount: number;

  @ApiProperty({ example: 'Family support' })
  @IsString()
  purpose: string;

  @ApiProperty({ example: 'payment_method_id_123' })
  @IsString()
  paymentMethodId: string;

  @ApiPropertyOptional({ example: 'bank_id_123' })
  @IsOptional()
  @IsString()
  recipientBankId?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  recipientAccount?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ example: '+2348123456789' })
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @ApiPropertyOptional({ example: 'user_id_123' })
  @IsOptional()
  @IsString()
  receiverId?: string;

  @ApiPropertyOptional({ example: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  targetCurrency?: string;
}

export class TransferQuoteDto {
  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(100)
  @Transform(({ value }) => Number(value))
  amount: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  targetCurrency?: string;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  sourceCurrency?: string;

  @IsOptional()
  @IsString()
  paymentMethodType?: string;
}