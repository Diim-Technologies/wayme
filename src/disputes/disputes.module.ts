import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispute, DisputeMessage, Transaction, User } from '../entities';
import { DisputesController, AdminDisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dispute, DisputeMessage, Transaction, User]),
        CommonModule,
    ],
    controllers: [DisputesController, AdminDisputesController],
    providers: [DisputesService],
    exports: [DisputesService],
})
export class DisputesModule { }
