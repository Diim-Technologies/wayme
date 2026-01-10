import { TransactionType, TransactionStatus } from '../enums/common.enum';
import { Transfer } from './transfer.entity';
import { Dispute } from './dispute.entity';
export declare class Transaction {
    id: string;
    transferId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    reference: string;
    gatewayRef: string;
    gatewayData: any;
    gatewayResponse: string;
    description: string;
    metadata: any;
    failureReason: string;
    processedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    transfer: Transfer;
    disputes: Dispute[];
}
