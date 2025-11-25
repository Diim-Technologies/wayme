import { Module } from '@nestjs/common';
import { CurrencyService } from './services/currency.service';
import { EmailService } from './services/email.service';
import { PaystackService } from './services/paystack.service';
import { FeeService } from './services/fee.service';
import { StripeService } from './services/stripe.service';
import { StripeWebhookService } from './services/stripe-webhook.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  providers: [CurrencyService, EmailService, PaystackService, FeeService, StripeService, StripeWebhookService],
  exports: [CurrencyService, EmailService, PaystackService, FeeService, StripeService, StripeWebhookService],
})
export class CommonModule {}