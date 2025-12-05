import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transfer } from '../entities/transfer.entity';
import { Transaction } from '../entities/transaction.entity';
import { StripePaymentMethod } from '../entities/stripe-payment-method.entity';
import { TransferStatus, TransactionType, TransactionStatus } from '../enums/common.enum';
import { StripeService } from '../common/services/stripe.service';
import { TransfersService } from '../transfers/transfers.service';
import { CreatePaymentDto, PaymentIntentResponseDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectRepository(Transfer)
        private transferRepository: Repository<Transfer>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(StripePaymentMethod)
        private stripePaymentMethodRepository: Repository<StripePaymentMethod>,
        private stripeService: StripeService,
        private transfersService: TransfersService,
    ) { }

    async createPaymentIntent(
        userId: string,
        dto: CreatePaymentDto,
    ): Promise<PaymentIntentResponseDto> {
        // Get transfer by reference
        const transfer = await this.transfersService.getTransferByReference(
            dto.transferReference,
            userId,
        );

        if (!transfer) {
            throw new NotFoundException('Transfer not found');
        }

        if (transfer.status !== TransferStatus.PENDING) {
            throw new BadRequestException(
                `Transfer cannot be paid. Current status: ${transfer.status}`,
            );
        }

        // Calculate total amount (amount + fees)
        const totalAmount = Number(transfer.amount) + Number(transfer.fee);

        // Get or create Stripe customer
        const customer = await this.stripeService.getOrCreateCustomer(
            userId,
            transfer.sender.email,
            `${transfer.sender.firstName} ${transfer.sender.lastName}`,
        );

        // Create payment intent
        const paymentIntent = await this.stripeService.createPaymentIntent(
            totalAmount,
            transfer.sourceCurrency,
            customer.id,
            undefined,
            {
                transferId: transfer.id,
                transferReference: transfer.reference,
                userId,
            },
        );

        this.logger.log(
            `Payment intent created: ${paymentIntent.id} for transfer: ${transfer.reference}`,
        );

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: totalAmount,
            currency: transfer.sourceCurrency.toLowerCase(),
            transferReference: transfer.reference,
        };
    }

    async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
        // Retrieve payment intent from Stripe
        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            throw new BadRequestException('Payment has not succeeded');
        }

        const transferId = paymentIntent.metadata.transferId;
        if (!transferId) {
            throw new BadRequestException('Transfer ID not found in payment metadata');
        }

        // Get transfer
        const transfer = await this.transferRepository.findOne({
            where: { id: transferId },
            relations: ['sender'],
        });

        if (!transfer) {
            throw new NotFoundException('Transfer not found');
        }

        // Create transaction record
        const transaction = this.transactionRepository.create({
            transferId: transfer.id,
            type: TransactionType.DEBIT,
            amount: Number(transfer.amount) + Number(transfer.fee),
            currency: transfer.sourceCurrency,
            status: TransactionStatus.SUCCESS,
            reference: paymentIntent.id,
            description: `Payment for transfer ${transfer.reference}`,
            metadata: {
                paymentIntentId: paymentIntent.id,
                stripeCustomerId: paymentIntent.customer,
                userId: transfer.senderId,
            },
        });

        await this.transactionRepository.save(transaction);

        this.logger.log(
            `Payment successful for transfer: ${transfer.reference}. Status set to PENDING for admin approval.`,
        );

        // Note: Transfer status remains PENDING - admin will approve it
    }

    async getAvailablePaymentMethods() {
        return this.stripePaymentMethodRepository.find({
            where: { isActive: true },
            order: { category: 'ASC', displayName: 'ASC' },
        });
    }

    async handlePaymentFailure(paymentIntentId: string): Promise<void> {
        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
        const transferId = paymentIntent.metadata.transferId;

        if (transferId) {
            const transfer = await this.transferRepository.findOne({
                where: { id: transferId },
            });

            if (transfer) {
                // Create failed transaction record
                const transaction = this.transactionRepository.create({
                    transferId: transfer.id,
                    type: TransactionType.DEBIT,
                    amount: Number(transfer.amount) + Number(transfer.fee),
                    currency: transfer.sourceCurrency,
                    status: TransactionStatus.FAILED,
                    reference: paymentIntent.id,
                    description: `Failed payment for transfer ${transfer.reference}`,
                    failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
                    metadata: {
                        paymentIntentId: paymentIntent.id,
                        userId: transfer.senderId,
                    },
                });

                await this.transactionRepository.save(transaction);

                this.logger.warn(
                    `Payment failed for transfer: ${transfer.reference}`,
                );
            }
        }
    }
}
