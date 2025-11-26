import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Transfer, Transaction, PaymentMethod, Bank, Fee, Currency, Notification } from '../entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transfer, Transaction, PaymentMethod, Bank, Fee, Currency, Notification]), 
    CommonModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}