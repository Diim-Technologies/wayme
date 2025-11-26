import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod, User, Transfer, Transaction } from '../entities';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, User, Transfer, Transaction]), CommonModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}