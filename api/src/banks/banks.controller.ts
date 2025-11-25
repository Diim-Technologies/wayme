import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BanksService } from './banks.service';

@ApiTags('Banks')
@Controller('banks')
export class BanksController {
  constructor(private banksService: BanksService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all supported banks (Public Endpoint)',
    description: 'Retrieve list of all supported banks for money transfers. Primarily focused on Nigerian banks integrated with Paystack verification.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Banks retrieved successfully',
    example: [
      {
        id: 'bank_123',
        name: 'Access Bank',
        code: '044',
        shortName: 'Access',
        country: 'NG',
        currency: 'NGN',
        isActive: true,
        paystackCode: '044'
      },
      {
        id: 'bank_456',
        name: 'Guaranty Trust Bank',
        code: '058',
        shortName: 'GTBank',
        country: 'NG',
        currency: 'NGN',
        isActive: true,
        paystackCode: '058'
      }
    ]
  })
  @ApiQuery({ 
    name: 'country', 
    required: false, 
    type: String, 
    example: 'NG',
    description: 'Filter banks by country code (ISO 3166-1 alpha-2). Default: all countries'
  })
  async getAllBanks(@Query('country') country?: string) {
    return this.banksService.getAllBanks(country);
  }

  @Get(':code')
  @ApiOperation({ 
    summary: 'Get bank details by bank code (Public Endpoint)',
    description: 'Retrieve detailed information about a specific bank using its bank code. Useful for validation and display purposes.'
  })
  @ApiParam({ 
    name: 'code', 
    description: 'Bank code (e.g., 044 for Access Bank)', 
    example: '044' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bank retrieved successfully',
    example: {
      id: 'bank_123',
      name: 'Access Bank',
      code: '044',
      shortName: 'Access',
      country: 'NG',
      currency: 'NGN',
      isActive: true,
      paystackCode: '044',
      supportedServices: ['TRANSFERS', 'VERIFICATION']
    }
  })
  @ApiResponse({ status: 404, description: 'Bank not found or not supported' })
  async getBankByCode(@Param('code') code: string) {
    return this.banksService.getBankByCode(code);
  }

  @Get('verify/:bankCode/:accountNumber')
  @ApiOperation({ 
    summary: 'Verify Nigerian bank account using Paystack (Public Endpoint)',
    description: 'Verify a Nigerian bank account number and retrieve the account holder\'s name using Paystack\'s account verification API. This is essential for transfer validation.'
  })
  @ApiParam({ 
    name: 'bankCode', 
    description: 'Nigerian bank code (e.g., 044 for Access Bank)', 
    example: '044' 
  })
  @ApiParam({ 
    name: 'accountNumber', 
    description: '10-digit Nigerian bank account number', 
    example: '0123456789' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Account verified successfully',
    example: {
      accountNumber: '0123456789',
      accountName: 'JOHN OLUMIDE DOE',
      bankCode: '044',
      bankName: 'Access Bank',
      verified: true
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid account number format or bank code' })
  @ApiResponse({ status: 404, description: 'Bank not found or account does not exist' })
  @ApiResponse({ status: 503, description: 'Paystack verification service temporarily unavailable' })
  async verifyAccountNumber(
    @Param('bankCode') bankCode: string,
    @Param('accountNumber') accountNumber: string,
  ) {
    return this.banksService.verifyAccountNumber(bankCode, accountNumber);
  }

  @Post('seed')
  @ApiOperation({ 
    summary: 'Seed initial banks data (Development Only)',
    description: 'Populate the database with initial Nigerian banks data. This endpoint is intended for development and testing purposes only.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Banks seeded successfully',
    example: {
      message: 'Banks seeded successfully',
      banksCreated: 25,
      existingBanks: 5
    }
  })
  @ApiResponse({ status: 500, description: 'Failed to seed banks data' })
  async seedBanks() {
    return this.banksService.seedBanks();
  }

  @Post('sync-paystack')
  @ApiOperation({ 
    summary: 'Synchronize banks from Paystack API (Admin Operation)',
    description: 'Fetch and update the list of supported banks from Paystack\'s API. This ensures our bank list stays current with Paystack\'s supported institutions.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Banks synchronized successfully from Paystack',
    example: {
      message: 'Banks synchronized successfully',
      banksUpdated: 28,
      newBanks: 3,
      lastSyncAt: '2024-11-14T15:30:00Z'
    }
  })
  @ApiResponse({ status: 500, description: 'Failed to sync banks from Paystack API' })
  @ApiResponse({ status: 503, description: 'Paystack API temporarily unavailable' })
  async syncBanksFromPaystack() {
    return this.banksService.syncBanksFromPaystack();
  }
}