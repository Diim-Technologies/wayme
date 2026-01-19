import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Decimal } from 'decimal.js';
import { Transfer } from '../entities/transfer.entity';
import { User } from '../entities/user.entity';
import { TransferStatus } from '../enums/common.enum';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
import { TransferQuoteDto, TransferQuoteResponseDto } from './dto/transfer-quote.dto';
import { CreateTransferDto, ProceedToTransferResponseDto } from './dto/create-transfer.dto';

@Injectable()
export class TransfersService {
    private readonly logger = new Logger(TransfersService.name);

    constructor(
        @InjectRepository(Transfer)
        private transferRepository: Repository<Transfer>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private currencyService: CurrencyService,
        private feeService: FeeService,
    ) { }

    async getTransferQuote(dto: TransferQuoteDto): Promise<TransferQuoteResponseDto> {
        const amount = new Decimal(dto.amount);

        // Get exchange rate
        const exchangeRate = await this.currencyService.getExchangeRate(
            dto.fromCurrency,
            dto.toCurrency,
        );

        // Calculate converted amount
        const convertedAmount = amount.mul(exchangeRate);

        // Calculate fees
        const transferFee = await this.feeService.calculateTransferFee(
            amount,
            dto.fromCurrency,
        );

        const conversionFee = await this.feeService.calculateCurrencyConversionFee(
            amount,
            dto.fromCurrency,
            dto.toCurrency,
        );

        const totalFee = transferFee.add(conversionFee);
        const totalAmount = amount.add(totalFee);

        // Quote expires in 15 minutes
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        return {
            amount: amount.toNumber(),
            fromCurrency: dto.fromCurrency,
            toCurrency: dto.toCurrency,
            exchangeRate: exchangeRate.toNumber(),
            convertedAmount: convertedAmount.toNumber(),
            transferFee: transferFee.toNumber(),
            conversionFee: conversionFee.toNumber(),
            totalFee: totalFee.toNumber(),
            totalAmount: totalAmount.toNumber(),
            expiresAt,
        };
    }

    async proceedToTransfer(
        userId: string,
        dto: CreateTransferDto,
    ): Promise<ProceedToTransferResponseDto> {
        // Verify user exists
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Get fresh quote
        const quote = await this.getTransferQuote({
            amount: dto.amount,
            fromCurrency: dto.fromCurrency,
            toCurrency: dto.toCurrency,
        });

        // Generate unique reference ID
        const reference = this.generateReferenceId();

        // Create transfer record
        const transfer = this.transferRepository.create({
            id: randomUUID(),
            sender: user,
            amount: dto.amount,
            fee: quote.totalFee,
            exchangeRate: quote.exchangeRate,
            sourceCurrency: dto.fromCurrency,
            targetCurrency: dto.toCurrency,
            purpose: dto.purpose,
            status: TransferStatus.PENDING,
            reference,
            recipientBankId: dto.recipientBankId,
            recipientAccount: dto.recipientAccount,
            recipientName: dto.recipientName,
            recipientPhone: dto.recipientPhone,
            notes: dto.notes,
            paymentMethodId: null, // Will be set when payment is made
        });

        await this.transferRepository.save(transfer);

        this.logger.log(`Transfer created: ${reference} for user: ${userId}`);

        return {
            referenceId: reference,
            amount: quote.amount,
            fromCurrency: quote.fromCurrency,
            toCurrency: quote.toCurrency,
            exchangeRate: quote.exchangeRate,
            transferFee: quote.transferFee,
            conversionFee: quote.conversionFee,
            totalFee: quote.totalFee,
            totalAmount: quote.totalAmount,
            status: TransferStatus.PENDING,
        };
    }

    async getTransferByReference(reference: string, userId?: string): Promise<Transfer> {
        const query: any = { reference };

        if (userId) {
            query.senderId = userId;
        }

        const transfer = await this.transferRepository.findOne({
            where: query,
            relations: ['sender', 'recipientBank'],
        });

        if (!transfer) {
            throw new NotFoundException('Transfer not found');
        }

        return transfer;
    }

    async getTransferById(id: string): Promise<Transfer> {
        const transfer = await this.transferRepository.findOne({
            where: { id },
            relations: ['sender', 'recipientBank'],
        });

        if (!transfer) {
            throw new NotFoundException('Transfer not found');
        }

        return transfer;
    }

    async getUserTransfers(
        userId: string,
        page: number = 1,
        limit: number = 10,
        status?: TransferStatus,
    ) {
        this.logger.log(`getUserTransfers called with userId: ${userId}, page: ${page}, limit: ${limit}, status: ${status}`);

        const skip = (page - 1) * limit;

        const queryBuilder = this.transferRepository
            .createQueryBuilder('transfer')
            .where('transfer.senderId = :userId', { userId })
            .leftJoinAndSelect('transfer.recipientBank', 'bank')
            .orderBy('transfer.createdAt', 'DESC')
            .skip(skip)
            .take(limit);

        if (status) {
            // Normalize status to uppercase to handle case-insensitive input
            const normalizedStatus = status.toString().toUpperCase();
            queryBuilder.andWhere('transfer.status = :status', { status: normalizedStatus });
        }

        const [transfers, total] = await queryBuilder.getManyAndCount();

        this.logger.log(`Found ${total} transfers for user ${userId}`);

        return {
            data: transfers.map(t => ({
                ...t,
                convertedAmount: new Decimal(t.amount).mul(t.exchangeRate || 0).toNumber(),
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async approveTransfer(transferId: string, adminId: string, notes?: string): Promise<Transfer> {
        const transfer = await this.getTransferById(transferId);

        if (transfer.status !== TransferStatus.PENDING) {
            throw new BadRequestException(
                `Transfer cannot be approved. Current status: ${transfer.status}`,
            );
        }

        transfer.status = TransferStatus.COMPLETED;
        transfer.processedAt = new Date();
        transfer.completedAt = new Date();

        if (notes) {
            transfer.notes = transfer.notes ? `${transfer.notes}\n\nAdmin: ${notes}` : `Admin: ${notes}`;
        }

        await this.transferRepository.save(transfer);

        this.logger.log(`Transfer ${transferId} approved by admin ${adminId}`);

        return transfer;
    }

    async updateTransferPaymentMethod(transferId: string, paymentMethodId: string): Promise<void> {
        await this.transferRepository.update(
            { id: transferId },
            { paymentMethodId },
        );
    }

    private generateReferenceId(): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `WMT-${timestamp}-${randomString}`;
    }
}
