import { Repository } from 'typeorm';
import { Transfer } from '../entities/transfer.entity';
import { Transaction } from '../entities/transaction.entity';
import { StripePaymentMethod } from '../entities/stripe-payment-method.entity';
import { StripeService } from '../common/services/stripe.service';
import { StripeWebhookService } from '../common/services/stripe-webhook.service';
import { TransfersService } from '../transfers/transfers.service';
import { CreatePaymentDto, PaymentIntentResponseDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private transferRepository;
    private transactionRepository;
    private stripePaymentMethodRepository;
    private stripeService;
    private stripeWebhookService;
    private transfersService;
    private readonly logger;
    constructor(transferRepository: Repository<Transfer>, transactionRepository: Repository<Transaction>, stripePaymentMethodRepository: Repository<StripePaymentMethod>, stripeService: StripeService, stripeWebhookService: StripeWebhookService, transfersService: TransfersService);
    createPaymentIntent(userId: string, dto: CreatePaymentDto): Promise<PaymentIntentResponseDto>;
    handlePaymentSuccess(paymentIntentId: string): Promise<void>;
    getAvailablePaymentMethods(): Promise<StripePaymentMethod[]>;
    constructWebhookEvent(payload: string | Buffer, signature: string): import("stripe").Stripe.Event;
    handleWebhookEvent(event: any): Promise<void>;
    handlePaymentFailure(paymentIntentId: string): Promise<void>;
}
