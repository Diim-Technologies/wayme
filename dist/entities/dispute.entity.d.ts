import { DisputeStatus, DisputeCategory, DisputePriority } from '../enums/dispute.enum';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { DisputeMessage } from './dispute-message.entity';
export declare class Dispute {
    id: string;
    generateId(): void;
    transactionId: string;
    userId: string;
    category: DisputeCategory;
    status: DisputeStatus;
    subject: string;
    description: string;
    priority: DisputePriority;
    resolvedAt: Date;
    resolvedBy: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    transaction: Transaction;
    resolver: User;
    messages: DisputeMessage[];
}
