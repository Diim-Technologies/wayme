import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Transfer } from '../entities/transfer.entity';
import { Transaction } from '../entities/transaction.entity';
import { StripePaymentMethod } from '../entities/stripe-payment-method.entity';
import { User } from '../entities/user.entity';
import { StripeService } from '../common/services/stripe.service';
import { TransfersModule } from '../transfers/transfers.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Transfer,
            Transaction,
            StripePaymentMethod,
            User,
        ]),
        TransfersModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService, StripeService],
    exports: [PaymentsService],
})
export class PaymentsModule { }
