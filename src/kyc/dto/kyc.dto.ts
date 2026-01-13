import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength, IsOptional } from 'class-validator';
import { DocumentType } from '../../enums/kyc.enum';
import { KycStatus } from '../../enums/user.enum';

export class SubmitKycFullDto {
    @ApiProperty({
        example: 'NATIONAL_ID',
        enum: [DocumentType.PASSPORT, DocumentType.NATIONAL_ID, DocumentType.RESIDENCE_PERMIT],
        description: 'Type of government ID being uploaded'
    })
    @IsEnum(DocumentType)
    documentType: DocumentType;
}

export class SubmitKycDto {
    // Empty DTO - just triggers KYC submission
}

export class RejectKycDto {
    @ApiProperty({
        example: 'Document is not clear enough. Please upload a clearer image.',
        description: 'Reason for rejecting the KYC'
    })
    @IsString()
    @MinLength(10)
    reason: string;
}

export class KycFilterDto {
    @ApiPropertyOptional({
        example: 'PENDING',
        enum: KycStatus,
        description: 'Filter by KYC status'
    })
    @IsOptional()
    @IsEnum(KycStatus)
    status?: KycStatus;
}
