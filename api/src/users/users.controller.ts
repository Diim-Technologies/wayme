import { Controller, Get, Put, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ 
    summary: 'Get current user basic information',
    description: 'Retrieve basic user account information for the authenticated user. This is a lightweight endpoint for user identification.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User information retrieved successfully',
    example: {
      id: 'user_123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      isActive: true,
      createdAt: '2024-11-14T10:00:00Z'
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  async getCurrentUser(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get('profile')
  @ApiOperation({ 
    summary: 'Get complete user profile',
    description: 'Retrieve complete user profile including personal information, KYC status, verification details, and account settings.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    example: {
      id: 'user_123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+2348123456789',
      dateOfBirth: '1990-01-15',
      address: '123 Lagos Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      isEmailVerified: true,
      isPhoneVerified: true,
      kycStatus: 'APPROVED',
      profileCompleteness: 95,
      lastLoginAt: '2024-11-14T12:30:00Z'
    }
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ 
    summary: 'Update user profile information',
    description: 'Update user profile details including personal information and address. Some fields may require KYC re-verification if changed.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    example: {
      message: 'Profile updated successfully',
      updated: true,
      kycReviewRequired: false
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid profile data or validation errors' })
  @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('transfers')
  @ApiOperation({ 
    summary: 'Get user transfer history with pagination',
    description: 'Retrieve paginated transfer history for the authenticated user including both sent and received transfers with detailed status information.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Transfer history retrieved successfully',
    example: {
      transfers: [
        {
          id: 'transfer_123',
          reference: 'WAY123456ABC',
          amount: 100.00,
          fee: 2.50,
          status: 'COMPLETED',
          type: 'SENT',
          recipientName: 'Jane Doe',
          createdAt: '2024-11-14T10:00:00Z'
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalItems: 25,
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
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: ['SENT', 'RECEIVED'],
    description: 'Filter by transfer type (optional)' 
  })
  async getTransferHistory(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.usersService.getTransferHistory(
      req.user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
     
    );
  }
}