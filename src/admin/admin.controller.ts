import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  UpdateUserRoleDto,
  UpdateKycStatusDto,
  UpdateTransferStatusDto,
  CreateExchangeRateDto,
  CreateAdminUserDto
} from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private adminService: AdminService) { }

  // Dashboard & Analytics
  @Get('dashboard')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Dashboard')
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description: 'Retrieve comprehensive dashboard statistics including user counts, transfer volumes, revenue metrics, and pending KYC approvals.'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    example: {
      totalUsers: 1250,
      totalTransfers: 3456,
      totalRevenue: 125000.50,
      pendingTransfers: 23,
      completedTransfers: 3400,
      failedTransfers: 33,
      pendingKyc: 15
    }
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions - Admin role required' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('logs')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Dashboard')
  @ApiOperation({
    summary: 'Get system activity logs',
    description: 'Retrieve system activity logs with pagination for monitoring user actions and system events.'
  })
  @ApiResponse({ status: 200, description: 'System logs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50, description: 'Number of logs per page (max 100)' })
  async getSystemLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getSystemLogs(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
    );
  }

  @Get('profile')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Dashboard')
  @ApiOperation({
    summary: 'Get current admin profile',
    description: 'Get the current admin user profile with role-based permissions.'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
    example: {
      id: 'admin_123',
      email: 'admin@wayame.com',
      firstName: 'John',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      permissions: ['view_dashboard', 'manage_users', 'system_settings']
    }
  })
  async getAdminProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      permissions: this.getPermissionsByRole(req.user.role),
    };
  }

  // User Management
  @Get('users')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - User Management')
  @ApiOperation({
    summary: 'Get all users with pagination and filtering',
    description: 'Retrieve all registered users with advanced filtering by role, KYC status, and pagination support.'
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    example: {
      users: [],
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalItems: 100,
        itemsPerPage: 20
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (max 50)' })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], description: 'Filter by user role' })
  @ApiQuery({ name: 'kycStatus', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'], description: 'Filter by KYC status' })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('kycStatus') kycStatus?: string,
  ) {
    return this.adminService.getAllUsers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      role,
      kycStatus,
    );
  }

  @Put('users/:id/role')
  @Roles('SUPER_ADMIN')
  @ApiTags('Admin - User Management')
  @ApiOperation({
    summary: 'Update user role (Super Admin only)',
    description: 'Change a user\'s role. Only Super Admin can perform this action.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user_123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
          description: 'New role for the user'
        }
      },
      required: ['role']
    }
  })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions - Super Admin role required' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, updateUserRoleDto);
  }

  @Post('users/create-admin')
  @Roles('SUPER_ADMIN')
  @ApiTags('Admin - User Management')
  @ApiOperation({
    summary: 'Create new admin user (Super Admin only)',
    description: 'Create a new user with ADMIN or SUPER_ADMIN role. The created user will be automatically verified and KYC approved. Only Super Admin can perform this action.'
  })
  @ApiBody({
    type: CreateAdminUserDto,
    examples: {
      admin: {
        summary: 'Create Admin User',
        value: {
          email: 'admin@wayame.com',
          firstName: 'John',
          lastName: 'Admin',
          phoneNumber: '+2348012345678',
          password: 'SecurePass123!',
          role: 'ADMIN'
        }
      },
      superAdmin: {
        summary: 'Create Super Admin User',
        value: {
          email: 'superadmin@wayame.com',
          firstName: 'Jane',
          lastName: 'SuperAdmin',
          phoneNumber: '+2348087654321',
          password: 'SuperSecure456!',
          role: 'SUPER_ADMIN'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Admin user created successfully',
    example: {
      id: 'user_abc123',
      email: 'admin@wayame.com',
      firstName: 'John',
      lastName: 'Admin',
      phoneNumber: '+2348012345678',
      role: 'ADMIN',
      isVerified: true,
      kycStatus: 'APPROVED',
      createdAt: '2024-12-17T10:30:00Z',
      updatedAt: '2024-12-17T10:30:00Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error - invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - email or phone number already exists' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions - Super Admin role required' })
  async createAdminUser(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.adminService.createAdminUser(createAdminUserDto);
  }

  @Patch('users/:id/kyc')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - User Management')
  @ApiOperation({
    summary: 'Update user KYC status',
    description: 'Approve, reject, or update KYC verification status for a user. Sends automatic notifications to the user.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user_123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        kycStatus: {
          type: 'string',
          enum: ['APPROVED', 'REJECTED', 'UNDER_REVIEW', 'PENDING'],
          description: 'New KYC status'
        },
        reason: {
          type: 'string',
          description: 'Reason for rejection (required if status is REJECTED)',
          example: 'Document quality too poor'
        }
      },
      required: ['kycStatus']
    }
  })
  @ApiResponse({ status: 200, description: 'KYC status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateKycStatus(
    @Param('id') userId: string,
    @Body() updateKycStatusDto: UpdateKycStatusDto,
  ) {
    return this.adminService.updateKycStatus(
      userId,
      updateKycStatusDto.kycStatus,
      updateKycStatusDto.reason,
    );
  }

  @Patch('users/:id/deactivate')
  @Roles('SUPER_ADMIN')
  @ApiTags('Admin - User Management')
  @ApiOperation({
    summary: 'Deactivate user account (Super Admin only)',
    description: 'Deactivate a user account, cancel pending transfers, and disable payment methods. Cannot deactivate Super Admin accounts.'
  })
  @ApiParam({ name: 'id', description: 'User ID to deactivate', example: 'user_123' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate super admin account' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions - Super Admin role required' })
  async deactivateUser(@Param('id') userId: string) {
    return this.adminService.deactivateUser(userId);
  }

  // Transfer Management
  @Get('transfers')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Transfer Management')
  @ApiOperation({
    summary: 'Get all transfers with pagination and filtering',
    description: 'Retrieve all money transfers with filtering by status and pagination support for admin oversight.'
  })
  @ApiResponse({
    status: 200,
    description: 'Transfers retrieved successfully',
    example: {
      transfers: [],
      pagination: {
        currentPage: 1,
        totalPages: 10,
        totalItems: 200,
        itemsPerPage: 20
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page (max 50)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
    description: 'Filter by transfer status'
  })
  async getAllTransfers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllTransfers(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      status,
    );
  }

  @Patch('transfers/:id/status')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Transfer Management')
  @ApiOperation({
    summary: 'Update transfer status',
    description: 'Manually update transfer status for administrative purposes. Sends notifications to users.'
  })
  @ApiParam({ name: 'id', description: 'Transfer ID', example: 'transfer_123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
          description: 'New transfer status'
        },
        reason: {
          type: 'string',
          description: 'Reason for status change (optional)',
          example: 'Manual review completed'
        }
      },
      required: ['status']
    }
  })
  @ApiResponse({ status: 200, description: 'Transfer status updated successfully' })
  @ApiResponse({ status: 404, description: 'Transfer not found' })
  async updateTransferStatus(
    @Param('id') transferId: string,
    @Body() updateTransferStatusDto: UpdateTransferStatusDto,
  ) {
    return this.adminService.updateTransferStatus(
      transferId,
      updateTransferStatusDto.status,
      updateTransferStatusDto.reason,
    );
  }

  // Exchange Rate Management
  @Get('exchange-rates')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Exchange Rates')
  @ApiOperation({
    summary: 'Get all exchange rates',
    description: 'Retrieve all currency exchange rates with buy/sell rates and last update timestamps.'
  })
  @ApiResponse({
    status: 200,
    description: 'Exchange rates retrieved successfully',
    example: [
      {
        id: 'rate_123',
        fromCurrency: 'NGN',
        toCurrency: 'USD',
        rate: 830.50,
        buyRate: 829.00,
        sellRate: 832.00,
        source: 'EXTERNAL_API',
        lastUpdated: '2024-11-14T10:30:00Z'
      }
    ]
  })
  async getAllExchangeRates() {
    return this.adminService.getAllExchangeRates();
  }

  @Post('exchange-rates')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Exchange Rates')
  @ApiOperation({
    summary: 'Create new exchange rate',
    description: 'Create a new currency exchange rate pair.'
  })
  @ApiResponse({ status: 201, description: 'Exchange rate created successfully' })
  async createExchangeRate(@Body() createExchangeRateDto: CreateExchangeRateDto) {
    return this.adminService.updateExchangeRate(
      createExchangeRateDto.fromCurrency,
      createExchangeRateDto.toCurrency,
      {
        rate: createExchangeRateDto.rate,
        buyRate: createExchangeRateDto.buyRate,
        sellRate: createExchangeRateDto.sellRate,
      },
    );
  }

  @Put('exchange-rates/:fromCurrency/:toCurrency')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Exchange Rates')
  @ApiOperation({
    summary: 'Update exchange rate manually',
    description: 'Manually set exchange rates for specific currency pairs. This will override automatic rates from external APIs.'
  })
  @ApiParam({ name: 'fromCurrency', description: 'Source currency code', example: 'NGN' })
  @ApiParam({ name: 'toCurrency', description: 'Target currency code', example: 'USD' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rate: { type: 'number', description: 'Exchange rate', example: 830.50 },
        buyRate: { type: 'number', description: 'Buy rate (optional)', example: 829.00 },
        sellRate: { type: 'number', description: 'Sell rate (optional)', example: 832.00 }
      },
      required: ['rate']
    }
  })
  @ApiResponse({ status: 200, description: 'Exchange rate updated successfully' })
  async updateExchangeRate(
    @Param('fromCurrency') fromCurrency: string,
    @Param('toCurrency') toCurrency: string,
    @Body() data: {
      rate: number;
      buyRate?: number;
      sellRate?: number;
    },
  ) {
    return this.adminService.updateExchangeRate(fromCurrency, toCurrency, data);
  }

  @Delete('exchange-rates/:fromCurrency/:toCurrency')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Exchange Rates')
  @ApiOperation({
    summary: 'Deactivate exchange rate',
    description: 'Deactivate an exchange rate pair. The system will fall back to default rates or external API rates.'
  })
  @ApiParam({ name: 'fromCurrency', description: 'Source currency code', example: 'NGN' })
  @ApiParam({ name: 'toCurrency', description: 'Target currency code', example: 'USD' })
  @ApiResponse({ status: 200, description: 'Exchange rate deactivated successfully' })
  async deactivateExchangeRate(
    @Param('fromCurrency') fromCurrency: string,
    @Param('toCurrency') toCurrency: string,
  ) {
    return this.adminService.deactivateExchangeRate(fromCurrency, toCurrency);
  }

  @Post('exchange-rates/refresh')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Exchange Rates')
  @ApiOperation({
    summary: 'Refresh exchange rates from external API',
    description: 'Force refresh all exchange rates from external API sources. This may take a few seconds to complete.'
  })
  @ApiResponse({
    status: 200,
    description: 'Exchange rates refreshed successfully',
    example: { message: 'Exchange rates updated successfully', updatedCount: 15 }
  })
  async refreshExchangeRates() {
    return this.adminService.refreshExchangeRates();
  }

  // Fee Configuration Management
  @Get('fee-configurations')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Fee Configuration')
  @ApiOperation({
    summary: 'Get all fee configurations',
    description: 'Retrieve all fee configuration settings including transfer fees, currency conversion fees, and payment processing fees.'
  })
  @ApiResponse({
    status: 200,
    description: 'Fee configurations retrieved successfully',
    example: [
      {
        id: 'fee_123',
        name: 'Standard Transfer Fee',
        type: 'TRANSFER_FEE',
        percentage: 2.5,
        fixedAmount: 50,

        currency: 'NGN',
        applicableTo: 'DOMESTIC,BANK_TRANSFER',
        isActive: true
      }
    ]
  })
  async getAllFeeConfigurations() {
    return this.adminService.getAllFeeConfigurations();
  }

  @Post('fee-configurations')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Fee Configuration')
  @ApiOperation({
    summary: 'Create new fee configuration',
    description: 'Create a new fee configuration for transfers, currency conversions, or payment processing.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Fee configuration name', example: 'Card Processing Fee' },
        type: {
          type: 'string',
          enum: ['TRANSFER_FEE', 'CURRENCY_CONVERSION_FEE', 'WITHDRAWAL_FEE', 'CARD_PROCESSING_FEE'],
          description: 'Type of fee'
        },
        percentage: { type: 'number', description: 'Percentage fee (0-100)', example: 2.5 },
        fixedAmount: { type: 'number', description: 'Fixed amount fee', example: 50 },

        currency: { type: 'string', description: 'Currency code', example: 'NGN' },
        applicableTo: {
          type: 'array',
          items: { type: 'string' },
          description: 'Applicable to types (DOMESTIC, INTERNATIONAL, CARD, BANK_TRANSFER)',
          example: ['DOMESTIC', 'BANK_TRANSFER']
        }
      },
      required: ['name', 'type']
    }
  })
  @ApiResponse({ status: 201, description: 'Fee configuration created successfully' })
  async createFeeConfiguration(
    @Body() data: {
      name: string;
      type: 'TRANSFER_FEE' | 'CURRENCY_CONVERSION_FEE' | 'WITHDRAWAL_FEE' | 'CARD_PROCESSING_FEE';
      percentage?: number;
      fixedAmount?: number;

      currency?: string;
      applicableTo?: string[];
    },
  ) {
    return this.adminService.createFeeConfiguration(data);
  }

  @Put('fee-configurations/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Fee Configuration')
  @ApiOperation({
    summary: 'Update fee configuration',
    description: 'Update an existing fee configuration. Changes take effect immediately for new transactions.'
  })
  @ApiParam({ name: 'id', description: 'Fee configuration ID', example: 'fee_123' })
  @ApiResponse({ status: 200, description: 'Fee configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Fee configuration not found' })
  async updateFeeConfiguration(
    @Param('id') id: string,
    @Body() data: {
      percentage?: number;
      fixedAmount?: number;

      applicableTo?: string[];
      isActive?: boolean;
    },
  ) {
    return this.adminService.updateFeeConfiguration(id, data);
  }

  @Delete('fee-configurations/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - Fee Configuration')
  @ApiOperation({
    summary: 'Delete fee configuration (Super Admin only)',
    description: 'Permanently delete a fee configuration. Use with caution - this action cannot be undone.'
  })
  @ApiParam({ name: 'id', description: 'Fee configuration ID', example: 'fee_123' })
  @ApiResponse({ status: 200, description: 'Fee configuration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Fee configuration not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions - Super Admin role required' })
  async deleteFeeConfiguration(@Param('id') id: string) {
    return this.adminService.deleteFeeConfiguration(id);
  }

  // System Settings Management
  @Get('system-settings')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - System Settings')
  @ApiOperation({
    summary: 'Get all system settings',
    description: 'Retrieve all system-wide configuration settings and their current values.'
  })
  @ApiResponse({
    status: 200,
    description: 'System settings retrieved successfully',
    example: [
      {
        id: 'setting_123',
        key: 'MAX_TRANSFER_AMOUNT',
        value: '1000000',
        description: 'Maximum transfer amount in kobo',
        type: 'NUMBER',
        isActive: true
      }
    ]
  })
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Put('system-settings/:key')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - System Settings')
  @ApiOperation({
    summary: 'Update system setting (Super Admin only)',
    description: 'Update a system-wide setting value. Changes may require application restart depending on the setting.'
  })
  @ApiParam({ name: 'key', description: 'Setting key', example: 'MAX_TRANSFER_AMOUNT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'New setting value', example: '2000000' }
      },
      required: ['value']
    }
  })
  @ApiResponse({ status: 200, description: 'System setting updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions - Super Admin role required' })
  async updateSystemSetting(
    @Param('key') key: string,
    @Body() data: { value: string },
  ) {
    return this.adminService.updateSystemSetting(key, data.value);
  }

  @Post('system-settings')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiTags('Admin - System Settings')
  @ApiOperation({
    summary: 'Create new system setting (Super Admin only)',
    description: 'Create a new system-wide configuration setting.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Setting key (unique)', example: 'NEW_FEATURE_ENABLED' },
        value: { type: 'string', description: 'Setting value', example: 'true' },
        description: { type: 'string', description: 'Setting description', example: 'Enable new feature' },
        type: {
          type: 'string',
          enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'],
          description: 'Value type',
          example: 'BOOLEAN'
        }
      },
      required: ['key', 'value']
    }
  })
  @ApiResponse({ status: 201, description: 'System setting created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions - Super Admin role required' })
  async createSystemSetting(
    @Body() data: {
      key: string;
      value: string;
      description?: string;
      type?: string;
    },
  ) {
    return this.adminService.createSystemSetting(data);
  }

  private getPermissionsByRole(role: string) {
    const permissions = {
      ADMIN: [
        'view_dashboard',
        'view_users',
        'view_transfers',
        'update_kyc',
        'update_transfer_status',
        'view_logs',
        'manage_exchange_rates',
        'manage_fee_configurations',
        'view_system_settings',
      ],
      SUPER_ADMIN: [
        'view_dashboard',
        'view_users',
        'view_transfers',
        'update_kyc',
        'update_transfer_status',
        'view_logs',
        'update_user_roles',
        'deactivate_users',
        'manage_exchange_rates',
        'manage_fee_configurations',
        'manage_system_settings',
        'delete_fee_configurations',
      ],
    };

    return permissions[role] || [];
  }
}