import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { PaymentMethod, User, Transfer, Transaction } from '../entities';
import { PaymentMethodType, TransferStatus } from '../enums/common.enum';
import { ConfigService } from '@nestjs/config';
import { PaystackService } from '../common/services/paystack.service';
import { StripeService } from '../common/services/stripe.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
    private configService: ConfigService,
    private paystackService: PaystackService,
    private stripeService: StripeService,
  ) {}

  async getUserPaymentMethods(userId: string) {
    return this.paymentMethodRepository.find({
      where: {
        userId,
        isActive: true,
      },
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async addCardPaymentMethod(userId: string, cardData: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvc: string;
    holderName: string;
  }) {
    try {
      // Get user details
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get or create Stripe customer
      const customer = await this.stripeService.getOrCreateCustomer(
        userId,
        user.email,
        `${user.firstName} ${user.lastName}`,
      );

      // Create payment method in Stripe
      const stripePaymentMethod = await this.stripeService.createPaymentMethod(customer.id, {
        type: 'card',
        card: {
          number: cardData.cardNumber,
          exp_month: cardData.expiryMonth,
          exp_year: cardData.expiryYear,
          cvc: cardData.cvc,
        },
      });

      // Save payment method to database
      const paymentMethod = this.paymentMethodRepository.create({
        userId,
        type: PaymentMethodType.CARD,
        cardDetails: {
          last4: stripePaymentMethod.card?.last4,
          brand: stripePaymentMethod.card?.brand,
          expiryMonth: stripePaymentMethod.card?.exp_month,
          expiryYear: stripePaymentMethod.card?.exp_year,
          holderName: cardData.holderName,
          fingerprint: stripePaymentMethod.card?.fingerprint,
          country: stripePaymentMethod.card?.country,
        },
        stripeId: stripePaymentMethod.id,
      });

      const savedPaymentMethod = await this.paymentMethodRepository.save(paymentMethod);

      // If this is the user's first payment method, make it default
      const userPaymentMethodsCount = await this.paymentMethodRepository.count({
        where: { userId, isActive: true },
      });

      if (userPaymentMethodsCount === 1) {
        await this.setDefaultPaymentMethod(userId, savedPaymentMethod.id);
      }

      return savedPaymentMethod;
    } catch (error) {
      if (error.type === 'StripeCardError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async addCardPaymentMethodWithSetupIntent(userId: string) {
    try {
      // Get user details
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get or create Stripe customer
      const customer = await this.stripeService.getOrCreateCustomer(
        userId,
        user.email,
        `${user.firstName} ${user.lastName}`,
      );

      // Create setup intent for saving payment method without charging
      const setupIntent = await this.stripeService.createSetupIntent(customer.id);

      return {
        setupIntentId: setupIntent.id,
        clientSecret: setupIntent.client_secret,
        customerId: customer.id,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create payment method setup');
    }
  }

  async confirmSetupIntent(userId: string, setupIntentId: string) {
    try {
      const setupIntent = await this.stripeService.retrieveSetupIntent(setupIntentId);
      
      if (setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        const paymentMethod = await this.stripeService.retrievePaymentMethod(
          setupIntent.payment_method as string
        );

        // Save payment method to database
        const dbPaymentMethod = this.paymentMethodRepository.create({
          userId,
          type: PaymentMethodType.CARD,
          cardDetails: {
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
            expiryMonth: paymentMethod.card?.exp_month,
            expiryYear: paymentMethod.card?.exp_year,
            fingerprint: paymentMethod.card?.fingerprint,
            country: paymentMethod.card?.country,
          },
          stripeId: paymentMethod.id,
        });

        const savedPaymentMethod = await this.paymentMethodRepository.save(dbPaymentMethod);

        // If this is the user's first payment method, make it default
        const userPaymentMethodsCount = await this.paymentMethodRepository.count({
          where: { userId, isActive: true },
        });

        if (userPaymentMethodsCount === 1) {
          await this.setDefaultPaymentMethod(userId, savedPaymentMethod.id);
        }

        return savedPaymentMethod;
      } else {
        throw new BadRequestException('Setup intent not completed successfully');
      }
    } catch (error) {
      throw new BadRequestException('Failed to confirm payment method setup');
    }
  }

  async addBankPaymentMethod(userId: string, bankData: any) {
    try {
      // Verify bank account with Paystack before adding
      const verification = await this.paystackService.verifyBankAccount(
        bankData.accountNumber,
        bankData.bankCode
      );

      // Use verified account name from Paystack
      const paymentMethod = this.paymentMethodRepository.create({
        userId,
        type: PaymentMethodType.BANK_TRANSFER,
        bankDetails: {
          accountNumber: verification.accountNumber,
          accountName: verification.accountName, // Use Paystack verified name
          bankName: bankData.bankName,
          bankCode: bankData.bankCode,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
        },
      });

      const savedPaymentMethod = await this.paymentMethodRepository.save(paymentMethod);

      // If this is the user's first payment method, make it default
      const userPaymentMethodsCount = await this.paymentMethodRepository.count({
        where: { userId, isActive: true },
      });

      if (userPaymentMethodsCount === 1) {
        await this.setDefaultPaymentMethod(userId, savedPaymentMethod.id);
      }

      return savedPaymentMethod;
    } catch (error) {
      // Re-throw Paystack validation errors
      if (error.status && error.message) {
        throw error;
      }
      
      throw new BadRequestException('Unable to verify bank account. Please check your details and try again.');
    }
  }

  async createPaymentIntent(
    userId: string,
    amount: number,
    currency: string,
    paymentMethodId?: string,
    transferId?: string,
  ) {
    try {
      // Get user details
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get or create Stripe customer
      const customer = await this.stripeService.getOrCreateCustomer(
        userId,
        user.email,
        `${user.firstName} ${user.lastName}`,
      );

      // Prepare metadata
      const metadata: Record<string, string> = {
        userId,
        userEmail: user.email,
      };

      if (transferId) {
        metadata.transferId = transferId;
      }

      // Create payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        currency,
        customer.id,
        paymentMethodId,
        metadata,
      );

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string) {
    try {
      const paymentIntent = await this.stripeService.confirmPaymentIntent(
        paymentIntentId,
        paymentMethodId,
      );

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new BadRequestException('Payment confirmation failed');
    }
  }

  async getPaymentIntentStatus(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
      
      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        lastPaymentError: paymentIntent.last_payment_error,
      };
    } catch (error) {
      throw new NotFoundException('Payment intent not found');
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number, reason?: string) {
    try {
      const refund = await this.stripeService.createRefund(
        paymentIntentId,
        amount,
        reason as any,
      );

      return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
      };
    } catch (error) {
      throw new BadRequestException('Failed to process refund');
    }
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    // Verify the payment method belongs to the user
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: {
        id: paymentMethodId,
        userId,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    await this.dataSource.transaction(async (manager) => {
      // Remove default from all other payment methods
      await manager.update(PaymentMethod, {
        userId,
        isActive: true,
      }, { isDefault: false });

      // Set the new default
      await manager.update(PaymentMethod, { id: paymentMethodId }, { isDefault: true });
    });

    return this.paymentMethodRepository.findOne({ where: { id: paymentMethodId } });
  }

  async removePaymentMethod(userId: string, paymentMethodId: string) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: {
        id: paymentMethodId,
        userId,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // Check if there are pending transfers using this payment method
    const pendingTransfers = await this.transferRepository.count({
      where: {
        paymentMethodId,
        status: In([TransferStatus.PENDING, TransferStatus.PROCESSING]),
      },
    });

    if (pendingTransfers > 0) {
      throw new BadRequestException(
        'Cannot remove payment method with pending transfers',
      );
    }

    // Detach from Stripe if it's a card
    if (paymentMethod.type === PaymentMethodType.CARD && paymentMethod.stripeId) {
      try {
        await this.stripeService.detachPaymentMethod(paymentMethod.stripeId);
      } catch (error) {
        // Log error but don't fail the operation
        console.error('Failed to detach payment method from Stripe:', error);
      }
    }

    // Soft delete the payment method
    const updatedPaymentMethod = await this.paymentMethodRepository.save({
      ...paymentMethod,
      isActive: false,
    });

    // If this was the default payment method, set another one as default
    if (paymentMethod.isDefault) {
      const nextPaymentMethod = await this.paymentMethodRepository.findOne({
        where: {
          userId,
          isActive: true,
          id: paymentMethodId, // Exclude current one
        },
        order: { createdAt: 'DESC' },
      });

      if (nextPaymentMethod) {
        await this.setDefaultPaymentMethod(userId, nextPaymentMethod.id);
      }
    }

    return updatedPaymentMethod;
  }
}