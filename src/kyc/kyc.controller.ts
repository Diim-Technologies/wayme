import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { KycService } from './kyc.service';
import {
    UploadDocumentDto,
    SubmitKycDto,
    RejectKycDto,
    KycFilterDto,
} from './dto/kyc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { multerConfig } from '../config/multer.config';
import { DocumentType } from '../enums/kyc.enum';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class KycController {
    constructor(private kycService: KycService) { }

    @Post('upload/government-id')
    @UseInterceptors(FileInterceptor('file', multerConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload government ID (Passport, National ID, Residence Permit)' })
    async uploadGovernmentId(
        @Request() req,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadDocumentDto,
    ) {
        if (dto.documentType === DocumentType.SELFIE) {
            return { message: 'Invalid document type for this endpoint. Use /upload/selfie' };
        }
        return this.kycService.uploadDocument(req.user.id, file, dto.documentType);
    }

    @Post('upload/selfie')
    @UseInterceptors(FileInterceptor('file', multerConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload selfie (Optional but Recommended)' })
    async uploadSelfie(
        @Request() req,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.kycService.uploadDocument(req.user.id, file, DocumentType.SELFIE);
    }

    @Post('submit')
    @ApiOperation({ summary: 'Submit KYC for review' })
    async submitKyc(@Request() req) {
        return this.kycService.submitKyc(req.user.id);
    }

    @Get('my-documents')
    @ApiOperation({ summary: 'Get my uploaded KYC documents' })
    async getMyDocuments(@Request() req) {
        return this.kycService.getMyDocuments(req.user.id);
    }

    @Get('status')
    @ApiOperation({ summary: 'Get my KYC status' })
    async getKycStatus(@Request() req) {
        return this.kycService.getKycStatus(req.user.id);
    }
}

@ApiTags('Admin - KYC')
@Controller('admin/kyc')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class AdminKycController {
    constructor(private kycService: KycService) { }

    @Get('submissions')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Get all KYC submissions' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getAllSubmissions(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query() filters?: KycFilterDto,
    ) {
        return this.kycService.getAllSubmissions(
            page ? Number(page) : 1,
            limit ? Number(limit) : 20,
            filters,
        );
    }

    @Get(':userId')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Get user KYC details and documents' })
    async getUserKyc(@Param('userId') userId: string) {
        return this.kycService.getUserKyc(userId);
    }

    @Post(':userId/approve')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Approve user KYC' })
    async approveKyc(@Request() req, @Param('userId') userId: string) {
        return this.kycService.approveKyc(userId, req.user.id);
    }

    @Post(':userId/reject')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Reject user KYC' })
    async rejectKyc(
        @Request() req,
        @Param('userId') userId: string,
        @Body() rejectDto: RejectKycDto,
    ) {
        return this.kycService.rejectKyc(userId, req.user.id, rejectDto);
    }
}
