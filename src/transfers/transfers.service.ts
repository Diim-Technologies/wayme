import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Decimal } from 'decimal.js';
import { Transfer, Transaction, PaymentMethod, Bank, User } from '../entities';
import { TransferStatus, TransactionType, TransactionStatus, PaymentMethodType } from '../enums/common.enum';
import { CreateTransferDto, TransferQuoteDto } from './dto/transfers.dto';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
import { StripeService } from '../common/services/stripe.service';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
    private dataSource: DataSource,
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
    const paymentMethod = await this.paymentMethodRepository.findOne({
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

    // Create transfer with relations
    const transfer = await this.dataSource.transaction(async (manager) => {
      // Create transfer
      const newTransfer = manager.create(Transfer, {
        senderId: userId,
        receiverId,
        amount: amount / 100, // Convert from kobo to naira
        fee: parseFloat(quote.fee.toString()),
        exchangeRate: parseFloat(quote.exchangeRate.toString()),
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
      });

      const savedTransfer = await manager.save(Transfer, newTransfer);

      // Create initial transaction record
      const transaction = manager.create(Transaction, {
        transferId: savedTransfer.id,
        type: TransactionType.DEBIT,
        amount: (amount + parseFloat(quote.fee.toString()) * 100) / 100,
        currency: 'NGN',
        reference: this.generateReference(),
      });

      await manager.save(Transaction, transaction);

      return savedTransfer;
    });

    // Get transfer with relations
    const transferWithRelations = await this.transferRepository.findOne({
      where: { id: transfer.id },
      relations: ['sender', 'receiver', 'paymentMethod', 'recipientBank'],
    });

    // If payment method is a card, create Stripe payment intent
    if (paymentMethod.type === PaymentMethodType.CARD && paymentMethod.stripeId) {
      try {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          select: ['email', 'firstName', 'lastName'],
        });

        const customer = await this.stripeService.getOrCreateCustomer(
          userId,
          user.email,
          `${user.firstName} ${user.lastName}`,
        );

        const totalAmount = amount + (parseFloat(quote.fee.toString()) * 100); // Total in kobo
        
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
        await this.transferRepository.update(
          { id: transfer.id },
          { status: TransferStatus.PROCESSING }
        );

        return {
          ...transferWithRelations,
          paymentIntent: {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status,
          },
        };
      } catch (error) {
        // If Stripe payment creation fails, mark transfer as failed
        await this.transferRepository.update(
          { id: transfer.id },
          { status: TransferStatus.FAILED }
        );

        await this.transactionRepository.update(
          { transferId: transfer.id },
          { 
            status: TransactionStatus.FAILED,
            failureReason: 'Failed to create payment intent',
          }
        );

        throw new BadRequestException('Failed to process payment. Please try again.');
      }
    }

    return transferWithRelations;
  }

  async createTransferWithPaymentIntent(userId: string, createTransferDto: CreateTransferDto) {
    // Create transfer first
    const transfer = await this.createTransfer(userId, createTransferDto);
    
    // If it already has a payment intent, return it
    if ('paymentIntent' in transfer) {
      return transfer;
    }

    // Otherwise, create payment intent separately for bank transfers or other methods
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: createTransferDto.paymentMethodId, userId },
    });

    if (paymentMethod?.type === PaymentMethodType.CARD && paymentMethod.stripeId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['email', 'firstName', 'lastName'],
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

      const totalAmount = createTransferDto.amount + (parseFloat(quote.fee.toString()) * 100);

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
    const transfer = await this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.sender', 'sender')
      .leftJoinAndSelect('transfer.receiver', 'receiver')
      .leftJoinAndSelect('transfer.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('transfer.recipientBank', 'recipientBank')
      .leftJoinAndSelect('transfer.transactions', 'transactions')
      .where('transfer.id = :id', { id })
      .andWhere('(transfer.senderId = :userId OR transfer.receiverId = :userId)', { userId })
      .select([
        'transfer',
        'sender.firstName', 'sender.lastName', 'sender.email',
        'receiver.firstName', 'receiver.lastName', 'receiver.email',
        'paymentMethod',
        'recipientBank',
        'transactions'
      ])
      .getOne();

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }

  async getUserTransfers(userId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    
    let query = this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.sender', 'sender')
      .leftJoinAndSelect('transfer.receiver', 'receiver')
      .leftJoinAndSelect('transfer.recipientBank', 'recipientBank')
      .where('(transfer.senderId = :userId OR transfer.receiverId = :userId)', { userId })
      .select([
        'transfer',
        'sender.firstName', 'sender.lastName', 'sender.email',
        'receiver.firstName', 'receiver.lastName', 'receiver.email',
        'recipientBank'
      ])
      .orderBy('transfer.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      query = query.andWhere('transfer.status = :status', { status });
    }

    const [transfers, total] = await query.getManyAndCount();

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
    const { amount, sourceCurrency = 'NGN', targetCurrency = 'NGN', paymentMethodType = PaymentMethodType.BANK_TRANSFER } = quoteDto;
    return this.calculateQuote(amount, sourceCurrency, targetCurrency, paymentMethodType);
  }

  async cancelTransfer(id: string, userId: string) {
    const transfer = await this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.transactions', 'transactions')
      .where('transfer.id = :id', { id })
      .andWhere('transfer.senderId = :userId', { userId })
      .andWhere('transfer.status IN (:...statuses)', { 
        statuses: [TransferStatus.PENDING, TransferStatus.PROCESSING] 
      })
      .getOne();

    if (!transfer) {
      throw new NotFoundException('Transfer not found or cannot be cancelled');
    }

    // If there's a Stripe payment intent, try to cancel it
    const stripeTransaction = transfer.transactions?.find(
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

    await this.transferRepository.update(
      { id },
      { status: TransferStatus.CANCELLED }
    );

    return this.transferRepository.findOne({
      where: { id },
      relations: ['sender', 'recipientBank'],
      select: {
        sender: {
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    });
  }

  private async calculateQuote(amount: number, sourceCurrency: string, targetCurrency: string, paymentMethodType: string = PaymentMethodType.BANK_TRANSFER) {
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