import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, Length } from 'class-validator';

export class AddCardDto {
  @ApiProperty({ example: '4111111111111111' })
  @IsString()
  @Length(13, 19)
  cardNumber: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  @Min(new Date().getFullYear())
  expiryYear: number;

  @ApiProperty({ example: '123' })
  @IsString()
  @Length(3, 4)
  cvc: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  holderName: string;
}

export class AddBankAccountDto {
  @ApiProperty({ example: '0123456789' })
  @IsString()
  @Length(10, 10)
  accountNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  accountName: string;

  @ApiProperty({ example: 'Access Bank' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: '044' })
  @IsString()
  bankCode: string;
}