import { DisputeStatus, DisputeCategory, DisputePriority } from '../enums/dispute.enum';
import { User } from './user.entity';
import { Transfer } from './transfer.entity';
import { DisputeMessage } from './dispute-message.entity';
export declare class Dispute {
    id: string;
    generateId(): void;
    transferId: string;
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
    transfer: Transfer;
    resolver: User;
    messages: DisputeMessage[];
}
