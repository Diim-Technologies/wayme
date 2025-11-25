import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../common/services/paystack.service';

@Injectable()
export class BanksService {
  constructor(
    private prisma: PrismaService,
    private paystackService: PaystackService,
  ) {}

  async getAllBanks(country = 'NG') {
    return this.prisma.bank.findMany({
      where: {
        country,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getBankByCode(code: string) {
    const bank = await this.prisma.bank.findUnique({
      where: { code },
    });

    if (!bank) {
      throw new NotFoundException('Bank not found');
    }

    return bank;
  }

  async verifyAccountNumber(bankCode: string, accountNumber: string) {
    try {
      // Get bank details from local database
      const bank = await this.getBankByCode(bankCode);
      
      // Verify account with Paystack
      const verification = await this.paystackService.verifyBankAccount(
        accountNumber,
        bankCode
      );

      return {
        accountNumber: verification.accountNumber,
        accountName: verification.accountName,
        bankName: bank.name,
        bankCode: bank.code,
        isValid: verification.isValid,
      };
    } catch (error) {
      // If it's a known error from Paystack, re-throw it
      if (error.status && error.message) {
        throw error;
      }
      
      // For unknown errors, throw a generic message
      throw new NotFoundException('Unable to verify account number at this time');
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
    } catch (error) {
      throw new Error(`Failed to sync banks from Paystack: ${error.message}`);
    }
  }

  async seedBanks() {
    // Popular Nigerian banks as fallback
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
}