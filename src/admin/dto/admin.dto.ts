import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsEmail, MinLength, Matches } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ example: 'ADMIN', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] })
  @IsEnum(['USER', 'ADMIN', 'SUPER_ADMIN'])
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export class UpdateKycStatusDto {
  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'] })
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'])
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';

  @ApiPropertyOptional({ example: 'Invalid document provided' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateTransferStatusDto {
  @ApiProperty({ example: 'COMPLETED', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'] })
  @IsEnum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'])
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

  @ApiPropertyOptional({ example: 'Insufficient funds' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AdminStatsDto {
  totalUsers: number;
  totalTransfers: number;
  totalRevenue: number;
  pendingTransfers: number;
  completedTransfers: number;
  failedTransfers: number;
  pendingKyc: number;
}

export class CreateExchangeRateDto {
  @ApiProperty({ example: 'USD', description: 'Source currency code' })
  @IsString()
  fromCurrency: string;

  @ApiProperty({ example: 'NGN', description: 'Target currency code' })
  @IsString()
  toCurrency: string;

  @ApiProperty({ example: 850.50, description: 'Exchange rate' })
  @IsNumber()
  rate: number;

  @ApiPropertyOptional({ example: 845.00, description: 'Buy rate' })
  @IsOptional()
  @IsNumber()
  buyRate?: number;

  @ApiPropertyOptional({ example: 855.00, description: 'Sell rate' })
  @IsOptional()
  @IsNumber()
  sellRate?: number;
}

export class CreateAdminUserDto {
  @ApiProperty({
    example: 'admin@wayame.com',
    description: 'Admin user email address'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'Admin user first name'
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Admin user last name'
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @ApiProperty({
    example: '+2348012345678',
    description: 'Admin user phone number (international format)'
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number in international format'
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Admin user password (min 8 characters, must include uppercase, lowercase, number, and special character)'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  password: string;

  @ApiProperty({
    example: 'ADMIN',
    enum: ['ADMIN', 'SUPER_ADMIN'],
    description: 'Role to assign to the admin user'
  })
  @IsEnum(['ADMIN', 'SUPER_ADMIN'], {
    message: 'Role must be either ADMIN or SUPER_ADMIN'
  })
  role: 'ADMIN' | 'SUPER_ADMIN';
}

import { FeeType } from '../../enums/common.enum';

export class CreateFeeConfigurationDto {
  @ApiProperty({ example: 'Card Processing Fee', description: 'Fee configuration name' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'TRANSFER_FEE',
    enum: FeeType,
    description: 'Type of fee'
  })
  @IsEnum(FeeType, {
    message: `Type must be one of: ${Object.values(FeeType).join(', ')}`
  })
  type: FeeType;

  @ApiPropertyOptional({ example: 2.5, description: 'Percentage fee (0-100)' })
  @IsOptional()
  @IsNumber()
  percentage?: number;

  @ApiPropertyOptional({ example: 50, description: 'Fixed amount fee' })
  @IsOptional()
  @IsNumber()
  fixedAmount?: number;

  @ApiPropertyOptional({ example: 'NGN', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: ['DOMESTIC', 'BANK_TRANSFER'],
    description: 'Applicable to types'
  })
  @IsOptional()
  @IsString({ each: true })
  applicableTo?: string[];
}

export class UpdateFeeConfigurationDto {
  @ApiPropertyOptional({ example: 2.5, description: 'Percentage fee (0-100)' })
  @IsOptional()
  @IsNumber()
  percentage?: number;

  @ApiPropertyOptional({ example: 50, description: 'Fixed amount fee' })
  @IsOptional()
  @IsNumber()
  fixedAmount?: number;

  @ApiPropertyOptional({
    example: ['DOMESTIC', 'BANK_TRANSFER'],
    description: 'Applicable to types'
  })
  @IsOptional()
  @IsString({ each: true })
  applicableTo?: string[];

  @ApiPropertyOptional({ example: true, description: 'Is fee active' })
  @IsOptional()
  isActive?: boolean;
}
