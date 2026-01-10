import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import {
    CreateDisputeDto,
    ReplyDisputeDto,
    UpdateDisputeStatusDto,
    CloseDisputeDto,
    DisputeFilterDto,
} from './dto/disputes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DisputesController {
    constructor(private disputesService: DisputesService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new dispute',
        description: 'Create a dispute for a transaction. Users can only create disputes for their own transactions.',
    })
    @ApiResponse({
        status: 201,
        description: 'Dispute created successfully',
        example: {
            id: 'dispute_123',
            transactionId: 'trans_456',
            userId: 'user_789',
            category: 'DELAYED_TRANSFER',
            status: 'OPEN',
            subject: 'Transfer not received',
            description: 'I sent money 3 days ago but recipient has not received it',
            priority: 'HIGH',
            createdAt: '2026-01-10T18:00:00Z',
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid data or dispute already exists' })
    @ApiResponse({ status: 403, description: 'Cannot create dispute for this transaction' })
    @ApiResponse({ status: 404, description: 'Transaction not found' })
    async createDispute(@Request() req, @Body() createDisputeDto: CreateDisputeDto) {
        return this.disputesService.createDispute(req.user.id, createDisputeDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get my disputes',
        description: 'Retrieve all disputes created by the authenticated user with pagination and filtering.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
    @ApiQuery({ name: 'category', required: false, enum: ['WRONG_AMOUNT', 'DELAYED_TRANSFER', 'UNAUTHORIZED', 'FAILED_TRANSACTION', 'POOR_SERVICE', 'OTHER'] })
    @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH'] })
    @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
    async getMyDisputes(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query() filters?: DisputeFilterDto,
    ) {
        return this.disputesService.getMyDisputes(
            req.user.id,
            page ? Number(page) : 1,
            limit ? Number(limit) : 20,
            filters,
        );
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get dispute details',
        description: 'Retrieve detailed information about a specific dispute including all messages.',
    })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiResponse({ status: 200, description: 'Dispute details retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Cannot view this dispute' })
    @ApiResponse({ status: 404, description: 'Dispute not found' })
    async getDisputeById(@Request() req, @Param('id') disputeId: string) {
        return this.disputesService.getDisputeById(disputeId, req.user.id);
    }

    @Post(':id/reply')
    @ApiOperation({
        summary: 'Reply to a dispute',
        description: 'Add a message to an existing dispute. Users can only reply to their own disputes.',
    })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiResponse({ status: 201, description: 'Reply added successfully' })
    @ApiResponse({ status: 400, description: 'Cannot reply to closed dispute' })
    @ApiResponse({ status: 403, description: 'Cannot reply to this dispute' })
    @ApiResponse({ status: 404, description: 'Dispute not found' })
    async replyToDispute(
        @Request() req,
        @Param('id') disputeId: string,
        @Body() replyDto: ReplyDisputeDto,
    ) {
        return this.disputesService.replyToDispute(disputeId, req.user.id, replyDto, false);
    }
}

@ApiTags('Admin - Disputes')
@Controller('admin/disputes')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class AdminDisputesController {
    constructor(private disputesService: DisputesService) { }

    @Get()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({
        summary: 'Get all disputes (Admin)',
        description: 'Retrieve all disputes in the system with pagination and filtering.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
    @ApiQuery({ name: 'category', required: false, enum: ['WRONG_AMOUNT', 'DELAYED_TRANSFER', 'UNAUTHORIZED', 'FAILED_TRANSACTION', 'POOR_SERVICE', 'OTHER'] })
    @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH'] })
    @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
    async getAllDisputes(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query() filters?: DisputeFilterDto,
    ) {
        return this.disputesService.getAllDisputes(
            page ? Number(page) : 1,
            limit ? Number(limit) : 20,
            filters,
        );
    }

    @Get(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({
        summary: 'Get dispute details (Admin)',
        description: 'Retrieve detailed information about any dispute.',
    })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiResponse({ status: 200, description: 'Dispute details retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Dispute not found' })
    async getDisputeById(@Request() req, @Param('id') disputeId: string) {
        return this.disputesService.getDisputeById(disputeId, req.user.id, true);
    }

    @Post(':id/reply')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({
        summary: 'Reply to dispute (Admin)',
        description: 'Add an admin reply to a dispute. This will update the dispute status to IN_PROGRESS if it was OPEN.',
    })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiResponse({ status: 201, description: 'Admin reply added successfully' })
    @ApiResponse({ status: 400, description: 'Cannot reply to closed dispute' })
    @ApiResponse({ status: 404, description: 'Dispute not found' })
    async replyToDispute(
        @Request() req,
        @Param('id') disputeId: string,
        @Body() replyDto: ReplyDisputeDto,
    ) {
        return this.disputesService.replyToDispute(disputeId, req.user.id, replyDto, true);
    }

    @Patch(':id/status')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({
        summary: 'Update dispute status (Admin)',
        description: 'Change the status of a dispute (OPEN, IN_PROGRESS, RESOLVED, CLOSED).',
    })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiResponse({ status: 200, description: 'Dispute status updated successfully' })
    @ApiResponse({ status: 404, description: 'Dispute not found' })
    async updateDisputeStatus(
        @Request() req,
        @Param('id') disputeId: string,
        @Body() updateDto: UpdateDisputeStatusDto,
    ) {
        return this.disputesService.updateDisputeStatus(disputeId, updateDto, req.user.id);
    }

    @Post(':id/close')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({
        summary: 'Close dispute (Admin)',
        description: 'Close a dispute with a resolution message. This marks the dispute as CLOSED and adds a final resolution message.',
    })
    @ApiParam({ name: 'id', description: 'Dispute ID' })
    @ApiResponse({ status: 200, description: 'Dispute closed successfully' })
    @ApiResponse({ status: 400, description: 'Dispute is already closed' })
    @ApiResponse({ status: 404, description: 'Dispute not found' })
    async closeDispute(
        @Request() req,
        @Param('id') disputeId: string,
        @Body() closeDto: CloseDisputeDto,
    ) {
        return this.disputesService.closeDispute(disputeId, closeDto, req.user.id);
    }
}
