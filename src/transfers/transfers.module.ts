import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer, Transaction, PaymentMethod, Bank, User } from '../entities';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transfer, Transaction, PaymentMethod, Bank, User]), CommonModule],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}