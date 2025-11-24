import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto, TransferQuoteDto } from './dto/transfers.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
import { StripeService } from '../common/services/stripe.service';

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,
    private currencyService: CurrencyService,
    private feeService: FeeService,
    private stripeService: StripeService,
  ) {}

  async createTransfer(userId: string, createTransferDto: CreateTransferDto) {
    const {
      amount,
      purpose,
      paymentMethodId,
      recipientBankId,
      recipientAccount,
      recipientName,
      recipientPhone, 
      receiverId,
      notes,
      targetCurrency = 'NGN',
    } = createTransferDto;

    // Verify payment method belongs to user
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId,
        isActive: true,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found or not active');
    }

    // Calculate fees and exchange rate using new services
    const quote = await this.calculateQuote(amount, 'NGN', targetCurrency, paymentMethod.type);

    // Generate unique reference
    const reference = this.generateReference();

    // Create transfer
    const transfer = await this.prisma.transfer.create({
      data: {
        senderId: userId,
        receiverId,
        amount: new Decimal(amount / 100), // Convert from kobo to naira
        fee: quote.fee,
        exchangeRate: quote.exchangeRate,
        sourceCurrency: 'NGN',
        targetCurrency,
        purpose,
        reference,
        paymentMethodId,
        recipientBankId,
        recipientAccount,
        recipientName,
        recipientPhone,
        notes,
      },
      include: {
        sender: {
          select: { firstName: true, lastName: true, email: true },
        },
        receiver: {
          select: { firstName: true, lastName: true, email: true },
        },
        paymentMethod: true,
        recipientBank: true,
      },
    });

    // Create initial transaction record
    await this.prisma.transaction.create({
      data: {
        transferId: transfer.id,
        type: 'DEBIT',
        amount: new Decimal((amount + quote.fee.toNumber() * 100) / 100),
        currency: 'NGN',
        reference: this.generateReference(),
      },
    });

    // If payment method is a card, create Stripe payment intent
    if (paymentMethod.type === 'CARD' && paymentMethod.stripeId) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, firstName: true, lastName: true },
        });

        const customer = await this.stripeService.getOrCreateCustomer(
          userId,
          user.email,
          `${user.firstName} ${user.lastName}`,
        );

        const totalAmount = amount + (quote.fee.toNumber() * 100); // Total in kobo
        
        const paymentIntent = await this.stripeService.createPaymentIntent(
          totalAmount / 100, // Convert to naira for Stripe
          'ngn',
          customer.id,
          paymentMethod.stripeId,
          {
            transferId: transfer.id,
            reference: transfer.reference,
            userId,
            userEmail: user.email,
          },
        );

        // Update transfer with payment intent information
        await this.prisma.transfer.update({
          where: { id: transfer.id },
          data: { status: 'PROCESSING' },
        });

        return {
          ...transfer,
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status,
          },
        };
      } catch (error) {
        // If Stripe payment creation fails, mark transfer as failed
        await this.prisma.transfer.update({
          where: { id: transfer.id },
          data: { status: 'FAILED' },
        });

        await this.prisma.transaction.updateMany({
          where: { transferId: transfer.id },
          data: { 
            status: 'FAILED',
            failureReason: 'Failed to create payment intent',
          },
        });

        throw new BadRequestException('Failed to process payment. Please try again.');
      }
    }

    return transfer;
  }

  async createTransferWithPaymentIntent(userId: string, createTransferDto: CreateTransferDto) {
    // Create transfer first
    const transfer = await this.createTransfer(userId, createTransferDto);
    
    // If it already has a payment intent, return it
    if ('paymentIntent' in transfer) {
      return transfer;
    }

    // Otherwise, create payment intent separately for bank transfers or other methods
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: createTransferDto.paymentMethodId, userId },
    });

    if (paymentMethod?.type === 'CARD' && paymentMethod.stripeId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true },
      });

      const customer = await this.stripeService.getOrCreateCustomer(
        userId,
        user.email,
        `${user.firstName} ${user.lastName}`,
      );

      const quote = await this.calculateQuote(
        createTransferDto.amount,
        'NGN',
        createTransferDto.targetCurrency || 'NGN',
        paymentMethod.type,
      );

      const totalAmount = createTransferDto.amount + (quote.fee.toNumber() * 100);

      const paymentIntent = await this.stripeService.createPaymentIntent(
        totalAmount / 100,
        'ngn',
        customer.id,
        undefined, // Don't auto-confirm, let client handle it
        {
          transferId: transfer.id,
          reference: transfer.reference,
          userId,
          userEmail: user.email,
        },
      );

      return {
        ...transfer,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status,
        },
      };
    }

    return transfer;
  }

  async getTransferById(id: string, userId: string) {
    const transfer = await this.prisma.transfer.findFirst({
      where: {
        id,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: { firstName: true, lastName: true, email: true },
        },
        receiver: {
          select: { firstName: true, lastName: true, email: true },
        },
        paymentMethod: true,
        recipientBank: true,
        transactions: true,
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }

  async getUserTransfers(userId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      OR: [{ senderId: userId }, { receiverId: userId }],
    };

    // Only add status filter if provided
    if (status) {
      where.status = status;
    }

    const [transfers, total] = await Promise.all([
      this.prisma.transfer.findMany({
        where,
        include: {
          sender: {
            select: { firstName: true, lastName: true, email: true },
          },
          receiver: {
            select: { firstName: true, lastName: true, email: true },
          },
          recipientBank: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transfer.count({ where }),
    ]);

    return {
      transfers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getQuote(quoteDto: TransferQuoteDto) {
    const { amount, sourceCurrency = 'NGN', targetCurrency = 'NGN', paymentMethodType = 'BANK_TRANSFER' } = quoteDto;
    return this.calculateQuote(amount, sourceCurrency, targetCurrency, paymentMethodType);
  }

  async cancelTransfer(id: string, userId: string) {
    const transfer = await this.prisma.transfer.findFirst({
      where: {
        id,
        senderId: userId,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      include: {
        transactions: true,
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found or cannot be cancelled');
    }

    // If there's a Stripe payment intent, try to cancel it
    const stripeTransaction = transfer.transactions.find(
      t => t.gatewayRef && t.gatewayRef.startsWith('pi_')
    );

    if (stripeTransaction?.gatewayRef) {
      try {
        await this.stripeService.cancelPaymentIntent(stripeTransaction.gatewayRef);
      } catch (error) {
        console.error('Failed to cancel Stripe payment intent:', error);
        // Continue with cancellation even if Stripe cancellation fails
      }
    }

    return this.prisma.transfer.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        sender: {
          select: { firstName: true, lastName: true, email: true },
        },
        recipientBank: true,
      },
    });
  }

  private async calculateQuote(amount: number, sourceCurrency: string, targetCurrency: string, paymentMethodType: string = 'BANK_TRANSFER') {
    // Convert amount from kobo to naira for calculation
    const amountInNaira = new Decimal(amount / 100);
    
    try {
      // Get exchange rate from currency service
      const exchangeRate = await this.currencyService.getExchangeRate(sourceCurrency, targetCurrency, 'sell');
      
      // Determine transfer type (domestic or international)
      const transferType = sourceCurrency === targetCurrency ? 'DOMESTIC' : 'INTERNATIONAL';
      
      // Calculate transfer fee using fee service
      const transferFee = await this.feeService.calculateTransferFee(
        amountInNaira, 
        transferType, 
        paymentMethodType, 
        sourceCurrency
      );
      
      // Calculate currency conversion fee if applicable
      const conversionFee = await this.feeService.calculateCurrencyConversionFee(
        amountInNaira, 
        sourceCurrency, 
        targetCurrency
      );
      
      // Total fee
      const totalFee = transferFee.add(conversionFee);
      
      // Convert amount to target currency
      const convertedAmount = amountInNaira.mul(exchangeRate);

      return {
        sourceAmount: amountInNaira,
        targetAmount: convertedAmount,
        fee: totalFee,
        transferFee,
        conversionFee,
        exchangeRate,
        sourceCurrency,
        targetCurrency,
        totalCost: amountInNaira.add(totalFee),
      };
    } catch (error) {
      // Fallback to old calculation method if services fail
      return this.fallbackCalculateQuote(amount, sourceCurrency, targetCurrency);
    }
  }

  private fallbackCalculateQuote(amount: number, sourceCurrency: string, targetCurrency: string) {
    // Convert amount from kobo to naira for calculation
    const amountInNaira = amount / 100;
    
    // Calculate fee (2.5% with minimum 50 NGN and maximum 500 NGN)
    let feeAmount = Math.max(50, Math.min(500, amountInNaira * 0.025));
    
    // Get exchange rate (mock implementation - in real app, fetch from external API)
    let exchangeRate = new Decimal(1);
    
    if (sourceCurrency !== targetCurrency) {
      // Mock exchange rates
      const rates = {
        'NGN_USD': 0.0012,
        'NGN_GBP': 0.001,
        'NGN_EUR': 0.0011,
        'USD_NGN': 830,
        'GBP_NGN': 1000,
        'EUR_NGN': 910,
      };
      
      const rateKey = `${sourceCurrency}_${targetCurrency}`;
      exchangeRate = new Decimal(rates[rateKey] || 1);
    }

    const convertedAmount = new Decimal(amountInNaira).mul(exchangeRate);

    return {
      sourceAmount: new Decimal(amountInNaira),
      targetAmount: convertedAmount,
      fee: new Decimal(feeAmount),
      transferFee: new Decimal(feeAmount),
      conversionFee: new Decimal(0),
      exchangeRate,
      sourceCurrency,
      targetCurrency,
      totalCost: new Decimal(amountInNaira).add(feeAmount),
    };
  }

  private generateReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WAY${timestamp.slice(-6)}${random}`;
  }
}