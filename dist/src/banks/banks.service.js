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
exports.BanksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paystack_service_1 = require("../common/services/paystack.service");
let BanksService = class BanksService {
    constructor(prisma, paystackService) {
        this.prisma = prisma;
        this.paystackService = paystackService;
    }
    async getAllBanks(country = 'NG') {
        return this.prisma.bank.findMany({
            where: {
                country,
                isActive: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async getBankByCode(code) {
        const bank = await this.prisma.bank.findUnique({
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
                const bank = await this.prisma.bank.upsert({
                    where: { code: paystackBank.code },
                    update: {
                        name: paystackBank.name,
                        isActive: true,
                    },
                    create: {
                        name: paystackBank.name,
                        code: paystackBank.code,
                        country: 'NG',
                        isActive: true,
                    },
                });
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
        const banks = [
            { name: 'Access Bank', code: '044' },
            { name: 'Guaranty Trust Bank', code: '058' },
            { name: 'United Bank for Africa', code: '033' },
            { name: 'Zenith Bank', code: '057' },
            { name: 'First Bank of Nigeria', code: '011' },
            { name: 'Fidelity Bank', code: '070' },
            { name: 'Ecobank Nigeria', code: '050' },
            { name: 'Diamond Bank', code: '063' },
            { name: 'Polaris Bank', code: '076' },
            { name: 'Union Bank of Nigeria', code: '032' },
            { name: 'Stanbic IBTC Bank', code: '221' },
            { name: 'Sterling Bank', code: '232' },
            { name: 'Wema Bank', code: '035' },
            { name: 'Unity Bank', code: '215' },
            { name: 'Keystone Bank', code: '082' },
        ];
        const seededBanks = [];
        for (const bank of banks) {
            const seededBank = await this.prisma.bank.upsert({
                where: { code: bank.code },
                update: {},
                create: {
                    name: bank.name,
                    code: bank.code,
                    country: 'NG',
                },
            });
            seededBanks.push(seededBank);
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        paystack_service_1.PaystackService])
], BanksService);
//# sourceMappingURL=banks.service.js.map