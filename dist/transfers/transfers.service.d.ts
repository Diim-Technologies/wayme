import { Repository, DataSource } from 'typeorm';
import { Decimal } from 'decimal.js';
import { Transfer, Transaction, PaymentMethod, Bank, User } from '../entities';
import { TransferStatus } from '../enums/common.enum';
import { CreateTransferDto, TransferQuoteDto } from './dto/transfers.dto';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
import { StripeService } from '../common/services/stripe.service';
export declare class TransfersService {
    private transferRepository;
    private transactionRepository;
    private paymentMethodRepository;
    private userRepository;
    private bankRepository;
    private dataSource;
    private currencyService;
    private feeService;
    private stripeService;
    constructor(transferRepository: Repository<Transfer>, transactionRepository: Repository<Transaction>, paymentMethodRepository: Repository<PaymentMethod>, userRepository: Repository<User>, bankRepository: Repository<Bank>, dataSource: DataSource, currencyService: CurrencyService, feeService: FeeService, stripeService: StripeService);
    createTransfer(userId: string, createTransferDto: CreateTransferDto): Promise<Transfer | {
        paymentIntent: {
            id: string;
            clientSecret: string;
            status: import("stripe").Stripe.PaymentIntent.Status;
        };
        id: string;
        senderId: string;
        receiverId: string;
        amount: number;
        fee: number;
        exchangeRate: number;
        sourceCurrency: string;
        targetCurrency: string;
        purpose: string;
        status: TransferStatus;
        reference: string;
        paymentMethodId: string;
        recipientBankId: string;
        recipientAccount: string;
        recipientName: string;
        recipientPhone: string;
        notes: string;
        processedAt: Date;
        completedAt: Date;
        createdAt: Date;
        updatedAt: Date;
        transactions: any[];
        paymentMethod: any;
        receiver: any;
        recipientBank: any;
        sender: any;
    }>;
    createTransferWithPaymentIntent(userId: string, createTransferDto: CreateTransferDto): Promise<Transfer>;
    getTransferById(id: string, userId: string): Promise<Transfer>;
    getUserTransfers(userId: string, page?: number, limit?: number, status?: string): Promise<{
        transfers: Transfer[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getQuote(quoteDto: TransferQuoteDto): Promise<{
        sourceAmount: Decimal;
        targetAmount: Decimal;
        fee: Decimal;
        transferFee: Decimal;
        conversionFee: Decimal;
        exchangeRate: Decimal;
        sourceCurrency: string;
        targetCurrency: string;
        totalCost: Decimal;
    }>;
    cancelTransfer(id: string, userId: string): Promise<Transfer>;
    private calculateQuote;
    private fallbackCalculateQuote;
    private generateReference;
}
