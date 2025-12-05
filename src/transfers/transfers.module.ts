import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { Transfer } from '../entities/transfer.entity';
import { User } from '../entities/user.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Transaction } from '../entities/transaction.entity';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { Fee } from '../entities/fee.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Transfer,
            User,
            PaymentMethod,
            Transaction,
            ExchangeRate,
            Fee,
        ]),
    ],
    controllers: [TransfersController],
    providers: [TransfersService, CurrencyService, FeeService],
    exports: [TransfersService],
})
export class TransfersModule { }
