import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Transfer } from '../entities/transfer.entity';
import { Transaction } from '../entities/transaction.entity';
import { StripePaymentMethod } from '../entities/stripe-payment-method.entity';
import { User } from '../entities/user.entity';
import { StripeService } from '../common/services/stripe.service';
import { StripeWebhookService } from '../common/services/stripe-webhook.service';
import { TransfersModule } from '../transfers/transfers.module';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Transfer,
            Transaction,
            StripePaymentMethod,
            User,
        ]),
        TransfersModule,
        CommonModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
