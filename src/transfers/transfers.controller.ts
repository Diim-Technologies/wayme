import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user.enum';
import { TransfersService } from './transfers.service';
import { TransferQuoteDto, TransferQuoteResponseDto } from './dto/transfer-quote.dto';
import { CreateTransferDto, ProceedToTransferResponseDto, ApproveTransferDto } from './dto/create-transfer.dto';

@ApiTags('Transfers')
@Controller('transfers')
export class TransfersController {
    constructor(private readonly transfersService: TransfersService) { }

    @Post('quote')
    @ApiOperation({ summary: 'Get transfer quote with exchange rate and fees' })
    @ApiResponse({ status: 200, description: 'Quote calculated successfully', type: TransferQuoteResponseDto })
    async getQuote(@Body() dto: TransferQuoteDto): Promise<TransferQuoteResponseDto> {
        return this.transfersService.getTransferQuote(dto);
    }

    @Post('proceed')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create transfer and generate reference ID' })
    @ApiResponse({ status: 201, description: 'Transfer created successfully', type: ProceedToTransferResponseDto })
    async proceedToTransfer(
        @Request() req,
        @Body() dto: CreateTransferDto,
    ): Promise<ProceedToTransferResponseDto> {
        return this.transfersService.proceedToTransfer(req.user.userId, dto);
    }

    @Get(':reference')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get transfer by reference ID' })
    @ApiResponse({ status: 200, description: 'Transfer found' })
    @ApiResponse({ status: 404, description: 'Transfer not found' })
    async getTransferByReference(
        @Request() req,
        @Param('reference') reference: string,
    ) {
        return this.transfersService.getTransferByReference(reference, req.user.userId);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user transfers with pagination' })
    @ApiResponse({ status: 200, description: 'Transfers retrieved successfully' })
    async getUserTransfers(
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('status') status?: string,
    ) {
        return this.transfersService.getUserTransfers(
            req.user.userId,
            Number(page),
            Number(limit),
            status as any,
        );
    }

    @Patch(':id/approve')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Approve transfer (Admin only)' })
    @ApiResponse({ status: 200, description: 'Transfer approved successfully' })
    @ApiResponse({ status: 400, description: 'Transfer cannot be approved' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async approveTransfer(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: ApproveTransferDto,
    ) {
        return this.transfersService.approveTransfer(id, req.user.userId, dto.notes);
    }
}
