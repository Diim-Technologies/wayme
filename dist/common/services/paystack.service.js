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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let PaystackService = class PaystackService {
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = 'https://api.paystack.co';
        this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
        if (!this.secretKey) {
            throw new Error('PAYSTACK_SECRET_KEY is required');
        }
    }
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
        };
    }
    async verifyBankAccount(accountNumber, bankCode) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/bank/resolve`, {
                params: {
                    account_number: accountNumber,
                    bank_code: bankCode,
                },
                headers: this.getHeaders(),
            });
            if (!response.data.status) {
                throw new common_1.BadRequestException(response.data.message || 'Invalid account details');
            }
            return {
                accountNumber: response.data.data.account_number,
                accountName: response.data.data.account_name,
                bankId: response.data.data.bank_id,
                isValid: true,
            };
        }
        catch (error) {
            if (error.response?.status === 422) {
                throw new common_1.BadRequestException('Invalid account number or bank code');
            }
            else if (error.response?.status === 400) {
                throw new common_1.BadRequestException('Could not resolve account name. Check parameters or try again.');
            }
            else if (error.response?.status === 401) {
                throw new common_1.HttpException('Invalid Paystack credentials', common_1.HttpStatus.UNAUTHORIZED);
            }
            else if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            else {
                console.error('Paystack API Error:', error.response?.data || error.message);
                throw new common_1.HttpException('Bank verification service temporarily unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
    }
    async getBankList() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/bank`, {
                params: {
                    country: 'nigeria',
                },
                headers: this.getHeaders(),
            });
            if (!response.data.status) {
                throw new common_1.HttpException('Failed to fetch bank list', common_1.HttpStatus.BAD_GATEWAY);
            }
            return response.data.data
                .filter(bank => bank.active && bank.country === 'Nigeria')
                .map(bank => ({
                id: bank.id,
                name: bank.name,
                code: bank.code,
                slug: bank.slug,
                longcode: bank.longcode,
            }));
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Paystack Bank List Error:', error.response?.data || error.message);
            throw new common_1.HttpException('Bank list service temporarily unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async validateBankCode(bankCode) {
        try {
            const banks = await this.getBankList();
            return banks.some(bank => bank.code === bankCode);
        }
        catch (error) {
            console.warn('Could not validate bank code due to service error:', error.message);
            return true;
        }
    }
};
exports.PaystackService = PaystackService;
exports.PaystackService = PaystackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaystackService);
//# sourceMappingURL=paystack.service.js.map