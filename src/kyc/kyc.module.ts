import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycDocument, User, UserProfile } from '../entities';
import { KycController, AdminKycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([KycDocument, User, UserProfile]),
        CommonModule,
    ],
    controllers: [KycController, AdminKycController],
    providers: [KycService],
    exports: [KycService],
})
export class KycModule { }
