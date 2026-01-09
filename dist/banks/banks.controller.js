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
exports.BanksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const banks_service_1 = require("./banks.service");
let BanksController = class BanksController {
    constructor(banksService) {
        this.banksService = banksService;
    }
    async getAllBanks(country) {
        return this.banksService.getAllBanks(country);
    }
    async getBankByCode(code) {
        return this.banksService.getBankByCode(code);
    }
    async verifyAccountNumber(bankCode, accountNumber) {
        return this.banksService.verifyAccountNumber(bankCode, accountNumber);
    }
    async seedBanks() {
        return this.banksService.seedBanks();
    }
    async syncBanksFromPaystack() {
        return this.banksService.syncBanksFromPaystack();
    }
};
exports.BanksController = BanksController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all supported banks (Public Endpoint)',
        description: 'Retrieve list of all supported banks for money transfers. Primarily focused on Nigerian banks integrated with Paystack verification.'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiQuery)({
        name: 'country',
        required: false,
        type: String,
        example: 'NG',
        description: 'Filter banks by country code (ISO 3166-1 alpha-2). Default: all countries'
    }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BanksController.prototype, "getAllBanks", null);
__decorate([
    (0, common_1.Get)(':code'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get bank details by bank code (Public Endpoint)',
        description: 'Retrieve detailed information about a specific bank using its bank code. Useful for validation and display purposes.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'code',
        description: 'Bank code (e.g., 044 for Access Bank)',
        example: '044'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bank not found or not supported' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BanksController.prototype, "getBankByCode", null);
__decorate([
    (0, common_1.Get)('verify/:bankCode/:accountNumber'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify Nigerian bank account using Paystack (Public Endpoint)',
        description: 'Verify a Nigerian bank account number and retrieve the account holder\'s name using Paystack\'s account verification API. This is essential for transfer validation.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'bankCode',
        description: 'Nigerian bank code (e.g., 044 for Access Bank)',
        example: '044'
    }),
    (0, swagger_1.ApiParam)({
        name: 'accountNumber',
        description: '10-digit Nigerian bank account number',
        example: '0123456789'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Account verified successfully',
        example: {
            accountNumber: '0123456789',
            accountName: 'JOHN OLUMIDE DOE',
            bankCode: '044',
            bankName: 'Access Bank',
            verified: true
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid account number format or bank code' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bank not found or account does not exist' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Paystack verification service temporarily unavailable' }),
    __param(0, (0, common_1.Param)('bankCode')),
    __param(1, (0, common_1.Param)('accountNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BanksController.prototype, "verifyAccountNumber", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Seed initial banks data (Development Only)',
        description: 'Populate the database with initial Nigerian banks data. This endpoint is intended for development and testing purposes only.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Banks seeded successfully',
        example: {
            message: 'Banks seeded successfully',
            banksCreated: 25,
            existingBanks: 5
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to seed banks data' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BanksController.prototype, "seedBanks", null);
__decorate([
    (0, common_1.Post)('sync-paystack'),
    (0, swagger_1.ApiOperation)({
        summary: 'Synchronize banks from Paystack API (Admin Operation)',
        description: 'Fetch and update the list of supported banks from Paystack\'s API. This ensures our bank list stays current with Paystack\'s supported institutions.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Banks synchronized successfully from Paystack',
        example: {
            message: 'Banks synchronized successfully',
            banksUpdated: 28,
            newBanks: 3,
            lastSyncAt: '2024-11-14T15:30:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Failed to sync banks from Paystack API' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Paystack API temporarily unavailable' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BanksController.prototype, "syncBanksFromPaystack", null);
exports.BanksController = BanksController = __decorate([
    (0, swagger_1.ApiTags)('Banks'),
    (0, common_1.Controller)('banks'),
    __metadata("design:paramtypes", [banks_service_1.BanksService])
], BanksController);
//# sourceMappingURL=banks.controller.js.map