import { User } from './user.entity';
import { Dispute } from './dispute.entity';
export declare class DisputeMessage {
    id: string;
    generateId(): void;
    disputeId: string;
    userId: string;
    message: string;
    isAdminReply: boolean;
    attachments: string[];
    createdAt: Date;
    dispute: Dispute;
    user: User;
}
