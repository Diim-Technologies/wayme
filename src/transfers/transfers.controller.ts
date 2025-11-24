import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CreateTransferDto, TransferQuoteDto } from './dto/transfers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create a new money transfer',
    description: 'Create a new money transfer to send money to recipients. For card payments, use the /transfers/with-payment endpoint instead for better payment flow integration.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Transfer created successfully',
    example: {
      id: 'transfer_123',
      reference: 'WAY123456ABC',
      amount: 100.00,
      fee: 2.50,
      status: 'PENDING',
      recipientName: 'John Doe',
      recipientAccount: '1234567890'
    }
  })
  @ApiResponse({ status: 404, description: 'Payment method not found or not active' })
  @ApiResponse({ status: 400, description: 'Invalid transfer details or insufficient funds' })
  async createTransfer(@Request() req, @Body() createTransferDto: CreateTransferDto) {
    return this.transfersService.createTransfer(req.user.id, createTransferDto);
  }

  @Post('quote')
  @ApiOperation({ 
    summary: 'Get transfer quote with fees and exchange rate (Public Endpoint)',
    description: 'Calculate transfer costs including fees and exchange rates before creating a transfer. No authentication required for quotes.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quote calculated successfully',
    example: {
      sourceAmount: 100.00,
      targetAmount: 0.12,
      fee: 2.50,
      transferFee: 2.00,
      conversionFee: 0.50,
      exchangeRate: 830.50,
      sourceCurrency: 'NGN',
      targetCurrency: 'USD',
      totalCost: 102.50
    }
  })
  async getQuote(@Body() quoteDto: TransferQuoteDto) {
    return this.transfersService.getQuote(quoteDto);
  }

  @Get('quote')
  @ApiOperation({ 
    summary: 'Calculate transfer quote via GET request (Public Endpoint)',
    description: 'Alternative GET endpoint for calculating transfer quotes. Useful for frontend integration where POST requests are inconvenient.'
  })
  @ApiResponse({ status: 200, description: 'Quote calculated successfully' })
  @ApiQuery({ name: 'amount', required: true, type: Number, example: 10000, description: 'Transfer amount in kobo (NGN)' })
  @ApiQuery({ name: 'sourceCurrency', required: false, type: String, example: 'NGN', description: 'Source currency code (default: NGN)' })
  @ApiQuery({ name: 'targetCurrency', required: false, type: String, example: 'USD', description: 'Target currency code (default: NGN)' })
  @ApiQuery({ name: 'paymentMethodType', required: false, enum: ['BANK_TRANSFER', 'CARD'], description: 'Payment method type (default: BANK_TRANSFER)' })
  async getQuoteViaGet(
    @Query('amount') amount: number,
    @Query('sourceCurrency') sourceCurrency?: string,
    @Query('targetCurrency') targetCurrency?: string,
    @Query('paymentMethodType') paymentMethodType?: string,
  ) {
    const quoteDto: TransferQuoteDto = {
      amount: Number(amount),
      sourceCurrency: sourceCurrency || 'NGN',
      targetCurrency: targetCurrency || 'NGN',
      paymentMethodType: paymentMethodType || 'BANK_TRANSFER',
    };
    return this.transfersService.getQuote(quoteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user transfers with pagination and filtering',
    description: 'Retrieve all transfers for the authenticated user with pagination and optional status filtering. Shows both sent and received transfers.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Transfers retrieved successfully',
    example: {
      transfers: [],
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalItems: 48,
        itemsPerPage: 10
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of transfers per page (default: 10, max: 50)' })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
    description: 'Filter transfers by status (optional)' 
  })
  async getUserTransfers(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.transfersService.getUserTransfers(
      req.user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      status,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get transfer details by ID',
    description: 'Retrieve detailed information about a specific transfer. Users can only access their own transfers (sent or received).'
  })
  @ApiParam({ name: 'id', description: 'Transfer ID', example: 'transfer_123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transfer retrieved successfully',
    example: {
      id: 'transfer_123',
      reference: 'WAY123456ABC',
      amount: 100.00,
      fee: 2.50,
      status: 'COMPLETED',
      sender: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      },
      recipient: {
        name: 'John Doe',
        account: '1234567890',
        bank: 'Access Bank'
      },
      transactions: [],
      createdAt: '2024-11-14T10:00:00Z'
    }
  })
  @ApiResponse({ status: 404, description: 'Transfer not found or access denied' })
  async getTransferById(@Request() req, @Param('id') id: string) {
    return this.transfersService.getTransferById(id, req.user.id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cancel a pending transfer',
    description: 'Cancel a transfer that is still pending or processing. This will also cancel any associated Stripe payment intents and refund if applicable.'
  })
  @ApiParam({ name: 'id', description: 'Transfer ID to cancel', example: 'transfer_123' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transfer cancelled successfully',
    example: {
      id: 'transfer_123',
      status: 'CANCELLED',
      cancelledAt: '2024-11-14T10:30:00Z'
    }
  })
  @ApiResponse({ status: 404, description: 'Transfer not found or cannot be cancelled (already completed/failed)' })
  @ApiResponse({ status: 403, description: 'Cannot cancel transfers sent by other users' })
  async cancelTransfer(@Request() req, @Param('id') id: string) {
    return this.transfersService.cancelTransfer(id, req.user.id);
  }

  @Post('with-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create transfer with Stripe payment intent (Recommended for Card Payments)',
    description: 'Create a transfer and automatically generate a Stripe PaymentIntent for card payments. This provides better error handling and 3D Secure support.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Transfer created with payment intent successfully',
    example: {
      id: 'transfer_123',
      reference: 'WAY123456ABC',
      status: 'PROCESSING',
      paymentIntent: {
        id: 'pi_1234567890',
        clientSecret: 'pi_1234567890_secret_abcd',
        status: 'requires_confirmation'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 400, description: 'Failed to create payment intent or invalid transfer details' })
  async createTransferWithPayment(@Request() req, @Body() createTransferDto: CreateTransferDto) {
    return this.transfersService.createTransferWithPaymentIntent(req.user.id, createTransferDto);
  }
}