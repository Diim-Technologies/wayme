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
exports.BanksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const paystack_service_1 = require("../common/services/paystack.service");
let BanksService = class BanksService {
    constructor(bankRepository, paystackService) {
        this.bankRepository = bankRepository;
        this.paystackService = paystackService;
    }
    async getAllBanks(country = 'NG') {
        return this.bankRepository.find({
            where: {
                country,
                isActive: true,
            },
            order: { name: 'ASC' },
        });
    }
    async getBankByCode(code) {
        const bank = await this.bankRepository.findOne({
            where: { code },
        });
        if (!bank) {
            throw new common_1.NotFoundException('Bank not found');
        }
        return bank;
    }
    async verifyAccountNumber(bankCode, accountNumber) {
        try {
            const bank = await this.getBankByCode(bankCode);
            const verification = await this.paystackService.verifyBankAccount(accountNumber, bankCode);
            return {
                accountNumber: verification.accountNumber,
                accountName: verification.accountName,
                bankName: bank.name,
                bankCode: bank.code,
                isValid: verification.isValid,
            };
        }
        catch (error) {
            if (error.status && error.message) {
                throw error;
            }
            throw new common_1.NotFoundException('Unable to verify account number at this time');
        }
    }
    async syncBanksFromPaystack() {
        try {
            const paystackBanks = await this.paystackService.getBankList();
            const syncedBanks = [];
            for (const paystackBank of paystackBanks) {
                let bank = await this.bankRepository.findOne({
                    where: { code: paystackBank.code },
                });
                if (bank) {
                    await this.bankRepository.update({ code: paystackBank.code }, {
                        name: paystackBank.name,
                        isActive: true,
                    });
                    bank = await this.bankRepository.findOne({
                        where: { code: paystackBank.code },
                    });
                }
                else {
                    bank = this.bankRepository.create({
                        name: paystackBank.name,
                        code: paystackBank.code,
                        country: 'NG',
                        isActive: true,
                    });
                    await this.bankRepository.save(bank);
                }
                syncedBanks.push(bank);
            }
            return {
                message: 'Banks synchronized successfully from Paystack',
                count: syncedBanks.length,
                banks: syncedBanks,
            };
        }
        catch (error) {
            throw new Error(`Failed to sync banks from Paystack: ${error.message}`);
        }
    }
    async seedBanks() {
        const banks = [];
        const seededBanks = [];
        for (const bankData of banks) {
            let bank = await this.bankRepository.findOne({
                where: { code: bankData.code },
            });
            if (!bank) {
                bank = this.bankRepository.create({
                    name: bankData.name,
                    code: bankData.code,
                    country: 'NG',
                });
                await this.bankRepository.save(bank);
            }
            seededBanks.push(bank);
        }
        return {
            message: 'Banks seeded successfully',
            count: seededBanks.length,
            banks: seededBanks,
        };
    }
};
exports.BanksService = BanksService;
exports.BanksService = BanksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Bank)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        paystack_service_1.PaystackService])
], BanksService);
//# sourceMappingURL=banks.service.js.map