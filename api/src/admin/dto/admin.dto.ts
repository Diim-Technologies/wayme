import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

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