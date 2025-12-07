import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const mode = this.configService.get<string>('STRIPE_MODE', 'test');

    let secretKey = this.configService.get<string>('STRIPE_SECRET_KEY'); // Fallback

    if (mode === 'live') {
      secretKey = this.configService.get<string>('STRIPE_SECRET_KEY_LIVE') || secretKey;
    } else {
      secretKey = this.configService.get<string>('STRIPE_SECRET_KEY_TEST') || secretKey;
    }

    if (!secretKey) {
      throw new Error(`STRIPE_SECRET_KEY is required for mode: ${mode}`);
    }

    this.logger.log(`Initializing Stripe in ${mode.toUpperCase()} mode`);

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16', // Use supported API version
    });
  }

  // Customer Management
  async createCustomer(userId: string, email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      this.logger.log(`Created Stripe customer: ${customer.id} for user: ${userId}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer for user ${userId}:`, error);
      throw new BadRequestException('Failed to create customer profile');
    }
  }

  async getOrCreateCustomer(userId: string, email: string, name: string): Promise<Stripe.Customer> {
    // Check if user already has a Stripe customer ID
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Look for existing customer by email
    const existingCustomers = await this.stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return this.createCustomer(userId, email, name);
  }

  // Payment Methods
  async createPaymentMethod(
    customerId: string,
    paymentMethodData: {
      type: 'card';
      card: {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
      };
    },
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create(paymentMethodData);

      // Attach to customer
      await this.stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId,
      });

      return paymentMethod;
    } catch (error) {
      this.logger.error('Failed to create payment method:', error);
      throw new BadRequestException('Invalid card details');
    }
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
    } catch (error) {
      this.logger.error('Failed to attach payment method:', error);
      throw new BadRequestException('Failed to attach payment method');
    }
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      this.logger.error('Failed to detach payment method:', error);
      throw new BadRequestException('Failed to remove payment method');
    }
  }

  async listCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods.data;
    } catch (error) {
      this.logger.error('Failed to list payment methods:', error);
      return [];
    }
  }

  // Payment Intents
  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    paymentMethodId?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (paymentMethodId) {
        paymentIntentData.payment_method = paymentMethodId;
        paymentIntentData.confirmation_method = 'manual';
        paymentIntentData.confirm = true;
        paymentIntentData.return_url = this.configService.get<string>('FRONTEND_URL') + '/payments/return';
      }

      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentData);

      this.logger.log(`Created payment intent: ${paymentIntent.id} for amount: ${amount} ${currency}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create payment intent:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const confirmData: Stripe.PaymentIntentConfirmParams = {
        return_url: this.configService.get<string>('FRONTEND_URL') + '/payments/return',
      };

      if (paymentMethodId) {
        confirmData.payment_method = paymentMethodId;
      }

      return await this.stripe.paymentIntents.confirm(paymentIntentId, confirmData);
    } catch (error) {
      this.logger.error('Failed to confirm payment intent:', error);
      throw new BadRequestException('Payment confirmation failed');
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to retrieve payment intent:', error);
      throw new BadRequestException('Payment intent not found');
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to cancel payment intent:', error);
      throw new BadRequestException('Failed to cancel payment');
    }
  }

  // Refunds
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
  ): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundData);
      this.logger.log(`Created refund: ${refund.id} for payment intent: ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error('Failed to create refund:', error);
      throw new BadRequestException('Failed to process refund');
    }
  }

  // Setup Intents (for saving payment methods without charging)
  async createSetupIntent(customerId: string, paymentMethodId?: string): Promise<Stripe.SetupIntent> {
    try {
      const setupIntentData: Stripe.SetupIntentCreateParams = {
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (paymentMethodId) {
        setupIntentData.payment_method = paymentMethodId;
        setupIntentData.confirm = true;
        setupIntentData.return_url = this.configService.get<string>('FRONTEND_URL') + '/payments/setup';
      }

      return await this.stripe.setupIntents.create(setupIntentData);
    } catch (error) {
      this.logger.error('Failed to create setup intent:', error);
      throw new BadRequestException('Failed to setup payment method');
    }
  }

  // Public method to retrieve setup intents
  async retrieveSetupIntent(setupIntentId: string): Promise<Stripe.SetupIntent> {
    try {
      return await this.stripe.setupIntents.retrieve(setupIntentId);
    } catch (error) {
      this.logger.error('Failed to retrieve setup intent:', error);
      throw new BadRequestException('Setup intent not found');
    }
  }

  // Public method to retrieve payment methods
  async retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return await this.stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      this.logger.error('Failed to retrieve payment method:', error);
      throw new BadRequestException('Payment method not found');
    }
  }

  // Webhook signature verification
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const mode = this.configService.get<string>('STRIPE_MODE', 'test');
    let webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET'); // Fallback

    if (mode === 'live') {
      webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET_LIVE') || webhookSecret;
    } else {
      webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET_TEST') || webhookSecret;
    }

    if (!webhookSecret) {
      throw new Error(`STRIPE_WEBHOOK_SECRET is required for mode: ${mode}`);
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  // Utility methods
  formatAmountForDisplay(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  convertToStripeAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  convertFromStripeAmount(amount: number): number {
    return amount / 100;
  }
}