import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

export interface PaystackBankVerificationResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export interface PaystackBankListResponse {
  status: boolean;
  message: string;
  data: Array<{
    id: number;
    name: string;
    slug: string;
    code: string;
    longcode: string;
    gateway: string;
    pay_with_bank: boolean;
    active: boolean;
    country: string;
    currency: string;
    type: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async verifyBankAccount(accountNumber: string, bankCode: string) {
    try {
      const response: AxiosResponse<PaystackBankVerificationResponse> = await axios.get(
        `${this.baseUrl}/bank/resolve`,
        {
          params: {
            account_number: accountNumber,
            bank_code: bankCode,
          },
          headers: this.getHeaders(),
        }
      );

      if (!response.data.status) {
        throw new BadRequestException(response.data.message || 'Invalid account details');
      }

      return {
        accountNumber: response.data.data.account_number,
        accountName: response.data.data.account_name,
        bankId: response.data.data.bank_id,
        isValid: true,
      };
    } catch (error) {
      if (error.response?.status === 422) {
        throw new BadRequestException('Invalid account number or bank code');
      } else if (error.response?.status === 400) {
        throw new BadRequestException('Could not resolve account name. Check parameters or try again.');
      } else if (error.response?.status === 401) {
        throw new HttpException('Invalid Paystack credentials', HttpStatus.UNAUTHORIZED);
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        console.error('Paystack API Error:', error.response?.data || error.message);
        throw new HttpException(
          'Bank verification service temporarily unavailable',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    }
  }

  async getBankList() {
    try {
      const response: AxiosResponse<PaystackBankListResponse> = await axios.get(
        `${this.baseUrl}/bank`,
        {
          params: {
            country: 'nigeria',

          },
          headers: this.getHeaders(),
        }
      );

      if (!response.data.status) {
        throw new HttpException('Failed to fetch bank list', HttpStatus.BAD_GATEWAY);
      }

      return response.data.data
        .filter(bank => bank.active && bank.country === 'NG')
        .map(bank => ({
          id: bank.id,
          name: bank.name,
          code: bank.code,
          slug: bank.slug,
          longcode: bank.longcode,
        }));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Paystack Bank List Error:', error.response?.data || error.message);
      throw new HttpException(
        'Bank list service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async validateBankCode(bankCode: string): Promise<boolean> {
    try {
      const banks = await this.getBankList();
      return banks.some(bank => bank.code === bankCode);
    } catch (error) {
      // If we can't fetch the bank list, assume the bank code might be valid
      // to avoid blocking legitimate requests due to service issues
      console.warn('Could not validate bank code due to service error:', error.message);
      return true;
    }
  }
}