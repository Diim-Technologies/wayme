import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { getTypeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransfersModule } from './transfers/transfers.module';
import { PaymentsModule } from './payments/payments.module';
import { BanksModule } from './banks/banks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { DisputesModule } from './disputes/disputes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    AuthModule,
    UsersModule,
    TransfersModule,
    PaymentsModule,
    BanksModule,
    NotificationsModule,
    AdminModule,
    BeneficiariesModule,
    DisputesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }