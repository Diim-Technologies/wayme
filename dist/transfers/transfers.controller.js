"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transfers_service_1 = require("./transfers.service");
const transfers_dto_1 = require("./dto/transfers.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TransfersController = class TransfersController {
    constructor(transfersService) {
        this.transfersService = transfersService;
    }
    async createTransfer(req, createTransferDto) {
        return this.transfersService.createTransfer(req.user.id, createTransferDto);
    }
    async getQuote(quoteDto) {
        return this.transfersService.getQuote(quoteDto);
    }
    async getQuoteViaGet(amount, sourceCurrency, targetCurrency, paymentMethodType) {
        const quoteDto = {
            amount: Number(amount),
            sourceCurrency: sourceCurrency || 'NGN',
            targetCurrency: targetCurrency || 'NGN',
            paymentMethodType: paymentMethodType || 'BANK_TRANSFER',
        };
        return this.transfersService.getQuote(quoteDto);
    }
    async getUserTransfers(req, page, limit, status) {
        return this.transfersService.getUserTransfers(req.user.id, page ? Number(page) : 1, limit ? Number(limit) : 10, status);
    }
    async getTransferById(req, id) {
        return this.transfersService.getTransferById(id, req.user.id);
    }
    async cancelTransfer(req, id) {
        return this.transfersService.cancelTransfer(id, req.user.id);
    }
    async createTransferWithPayment(req, createTransferDto) {
        return this.transfersService.createTransferWithPaymentIntent(req.user.id, createTransferDto);
    }
};
exports.TransfersController = TransfersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new money transfer',
        description: 'Create a new money transfer to send money to recipients. For card payments, use the /transfers/with-payment endpoint instead for better payment flow integration.'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment method not found or not active' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid transfer details or insufficient funds' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transfers_dto_1.CreateTransferDto]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "createTransfer", null);
__decorate([
    (0, common_1.Post)('quote'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transfer quote with fees and exchange rate (Public Endpoint)',
        description: 'Calculate transfer costs including fees and exchange rates before creating a transfer. No authentication required for quotes.'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfers_dto_1.TransferQuoteDto]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "getQuote", null);
__decorate([
    (0, common_1.Get)('quote'),
    (0, swagger_1.ApiOperation)({
        summary: 'Calculate transfer quote via GET request (Public Endpoint)',
        description: 'Alternative GET endpoint for calculating transfer quotes. Useful for frontend integration where POST requests are inconvenient.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quote calculated successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'amount', required: true, type: Number, example: 10000, description: 'Transfer amount in kobo (NGN)' }),
    (0, swagger_1.ApiQuery)({ name: 'sourceCurrency', required: false, type: String, example: 'NGN', description: 'Source currency code (default: NGN)' }),
    (0, swagger_1.ApiQuery)({ name: 'targetCurrency', required: false, type: String, example: 'USD', description: 'Target currency code (default: NGN)' }),
    (0, swagger_1.ApiQuery)({ name: 'paymentMethodType', required: false, enum: ['BANK_TRANSFER', 'CARD'], description: 'Payment method type (default: BANK_TRANSFER)' }),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('sourceCurrency')),
    __param(2, (0, common_1.Query)('targetCurrency')),
    __param(3, (0, common_1.Query)('paymentMethodType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "getQuoteViaGet", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user transfers with pagination and filtering',
        description: 'Retrieve all transfers for the authenticated user with pagination and optional status filtering. Shows both sent and received transfers.'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1, description: 'Page number for pagination (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of transfers per page (default: 10, max: 50)' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
        description: 'Filter transfers by status (optional)'
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "getUserTransfers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transfer details by ID',
        description: 'Retrieve detailed information about a specific transfer. Users can only access their own transfers (sent or received).'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Transfer ID', example: 'transfer_123' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transfer not found or access denied' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "getTransferById", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel a pending transfer',
        description: 'Cancel a transfer that is still pending or processing. This will also cancel any associated Stripe payment intents and refund if applicable.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Transfer ID to cancel', example: 'transfer_123' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transfer cancelled successfully',
        example: {
            id: 'transfer_123',
            status: 'CANCELLED',
            cancelledAt: '2024-11-14T10:30:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transfer not found or cannot be cancelled (already completed/failed)' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot cancel transfers sent by other users' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "cancelTransfer", null);
__decorate([
    (0, common_1.Post)('with-payment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create transfer with Stripe payment intent (Recommended for Card Payments)',
        description: 'Create a transfer and automatically generate a Stripe PaymentIntent for card payments. This provides better error handling and 3D Secure support.'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment method not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Failed to create payment intent or invalid transfer details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transfers_dto_1.CreateTransferDto]),
    __metadata("design:returntype", Promise)
], TransfersController.prototype, "createTransferWithPayment", null);
exports.TransfersController = TransfersController = __decorate([
    (0, swagger_1.ApiTags)('Transfers'),
    (0, common_1.Controller)('transfers'),
    __metadata("design:paramtypes", [transfers_service_1.TransfersService])
], TransfersController);
//# sourceMappingURL=transfers.controller.js.map