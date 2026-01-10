import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID, MinLength, IsArray } from 'class-validator';
import { DisputeCategory, DisputePriority, DisputeStatus } from '../../enums/dispute.enum';

export class CreateDisputeDto {
    @ApiProperty({
        example: 'trans_123',
        description: 'Transaction ID to dispute'
    })
    @IsUUID()
    transactionId: string;

    @ApiProperty({
        example: 'DELAYED_TRANSFER',
        enum: DisputeCategory,
        description: 'Category of the dispute'
    })
    @IsEnum(DisputeCategory)
    category: DisputeCategory;

    @ApiProperty({
        example: 'Transfer not received',
        description: 'Brief subject of the dispute'
    })
    @IsString()
    @MinLength(5)
    subject: string;

    @ApiProperty({
        example: 'I sent money 3 days ago but the recipient has not received it yet. Transaction reference: TXN123456',
        description: 'Detailed description of the issue'
    })
    @IsString()
    @MinLength(20)
    description: string;

    @ApiPropertyOptional({
        example: 'HIGH',
        enum: DisputePriority,
        description: 'Priority level of the dispute',
        default: 'MEDIUM'
    })
    @IsOptional()
    @IsEnum(DisputePriority)
    priority?: DisputePriority;
}

export class ReplyDisputeDto {
    @ApiProperty({
        example: 'I have checked with the recipient and they confirm they have not received the funds.',
        description: 'Reply message'
    })
    @IsString()
    @MinLength(10)
    message: string;

    @ApiPropertyOptional({
        example: ['https://example.com/screenshot.png'],
        description: 'Optional attachment URLs',
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
}

export class UpdateDisputeStatusDto {
    @ApiProperty({
        example: 'IN_PROGRESS',
        enum: DisputeStatus,
        description: 'New status for the dispute'
    })
    @IsEnum(DisputeStatus)
    status: DisputeStatus;
}

export class CloseDisputeDto {
    @ApiProperty({
        example: 'Issue resolved. The transfer was completed successfully and the recipient has confirmed receipt of funds.',
        description: 'Resolution message explaining how the dispute was resolved'
    })
    @IsString()
    @MinLength(20)
    resolution: string;
}

export class DisputeFilterDto {
    @ApiPropertyOptional({
        example: 'OPEN',
        enum: DisputeStatus,
        description: 'Filter by dispute status'
    })
    @IsOptional()
    @IsEnum(DisputeStatus)
    status?: DisputeStatus;

    @ApiPropertyOptional({
        example: 'DELAYED_TRANSFER',
        enum: DisputeCategory,
        description: 'Filter by dispute category'
    })
    @IsOptional()
    @IsEnum(DisputeCategory)
    category?: DisputeCategory;

    @ApiPropertyOptional({
        example: 'HIGH',
        enum: DisputePriority,
        description: 'Filter by priority'
    })
    @IsOptional()
    @IsEnum(DisputePriority)
    priority?: DisputePriority;
}
