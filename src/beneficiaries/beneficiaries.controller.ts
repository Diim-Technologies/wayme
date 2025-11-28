import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
    Param,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { BeneficiariesService } from './beneficiaries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user.enum';

@ApiTags('Beneficiaries')
@Controller('beneficiaries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BeneficiariesController {
    constructor(private readonly beneficiariesService: BeneficiariesService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new beneficiary',
        description: 'Save beneficiary details for quick access during transfers. Beneficiary information includes name, account details, bank, email, and phone number.'
    })
    @ApiResponse({
        status: 201,
        description: 'Beneficiary created successfully',
        example: {
            id: 'ben_123',
            userId: 'user_456',
            name: 'Jane Doe',
            accountName: 'Jane Doe',
            accountNumber: '0123456789',
            bankName: 'First Bank',
            bankCode: '011',
            email: 'jane@example.com',
            phoneNumber: '+2348123456789',
            createdAt: '2024-11-28T10:00:00Z'
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid beneficiary data or validation errors' })
    @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
    @ApiResponse({ status: 409, description: 'Beneficiary already exists for this user' })
    async createBeneficiary(@Request() req, @Body() body: any) {
        return this.beneficiariesService.createBeneficiary(req.user.id, body);
    }

    @Get()
    @ApiOperation({
        summary: 'Get user beneficiaries',
        description: 'Retrieve all saved beneficiaries for the authenticated user. Returns a list of beneficiary details for quick transfers.'
    })
    @ApiResponse({
        status: 200,
        description: 'Beneficiaries retrieved successfully',
        example: [
            {
                id: 'ben_123',
                userId: 'user_456',
                name: 'Jane Doe',
                accountName: 'Jane Doe',
                accountNumber: '0123456789',
                bankName: 'First Bank',
                bankCode: '011',
                email: 'jane@example.com',
                phoneNumber: '+2348123456789',
                createdAt: '2024-11-28T10:00:00Z'
            },
            {
                id: 'ben_124',
                userId: 'user_456',
                name: 'John Smith',
                accountName: 'John Smith',
                accountNumber: '9876543210',
                bankName: 'GTBank',
                bankCode: '058',
                email: 'john@example.com',
                phoneNumber: '+2348098765432',
                createdAt: '2024-11-27T15:30:00Z'
            }
        ]
    })
    @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
    async getUserBeneficiaries(@Request() req) {
        return this.beneficiariesService.getUserBeneficiaries(req.user.id);
    }

    @Get('admin')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get all beneficiaries (Admin only)',
        description: 'Retrieve all beneficiaries across all users. This endpoint is restricted to administrators and super administrators for monitoring and support purposes.'
    })
    @ApiResponse({
        status: 200,
        description: 'All beneficiaries retrieved successfully',
        example: [
            {
                id: 'ben_123',
                userId: 'user_456',
                userName: 'Alice Johnson',
                name: 'Jane Doe',
                accountName: 'Jane Doe',
                accountNumber: '0123456789',
                bankName: 'First Bank',
                bankCode: '011',
                email: 'jane@example.com',
                phoneNumber: '+2348123456789',
                createdAt: '2024-11-28T10:00:00Z'
            }
        ]
    })
    @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getAllBeneficiaries() {
        return this.beneficiariesService.getAllBeneficiaries();
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete a beneficiary',
        description: 'Remove a saved beneficiary from the user\'s list. Users can only delete their own beneficiaries.'
    })
    @ApiParam({
        name: 'id',
        description: 'Beneficiary ID to delete',
        example: 'ben_123',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Beneficiary deleted successfully',
        example: {
            message: 'Beneficiary deleted successfully',
            deleted: true
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid or expired JWT token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete another user\'s beneficiary' })
    @ApiResponse({ status: 404, description: 'Beneficiary not found' })
    async deleteBeneficiary(@Request() req, @Param('id') id: string) {
        return this.beneficiariesService.deleteBeneficiary(id, req.user.id);
    }
}
