import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ExchangeRate, Fee, User, Transfer, Transaction, PaymentMethod, Notification } from '../entities';
import { EmailService } from './services/email.service';
import { PaystackService } from './services/paystack.service';
import { StripeService } from './services/stripe.service';
import { CurrencyService } from './services/currency.service';
import { FeeService } from './services/fee.service';
import { StripeWebhookService } from './services/stripe-webhook.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ExchangeRate, Fee, User, Transfer, Transaction, PaymentMethod, Notification]),
  ],
  providers: [
    CurrencyService,
    EmailService,
    PaystackService,
    FeeService,
    StripeService,
    StripeWebhookService,
  ],
  exports: [
    CurrencyService,
    EmailService,
    PaystackService,
    FeeService,
    StripeService,
    StripeWebhookService,
  ],
})
export class CommonModule {}