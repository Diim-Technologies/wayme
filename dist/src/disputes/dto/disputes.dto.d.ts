import { DisputeCategory, DisputePriority, DisputeStatus } from '../../enums/dispute.enum';
export declare class CreateDisputeDto {
    transferId: string;
    category: DisputeCategory;
    subject: string;
    description: string;
    priority?: DisputePriority;
}
export declare class ReplyDisputeDto {
    message: string;
    attachments?: string[];
}
export declare class UpdateDisputeStatusDto {
    status: DisputeStatus;
}
export declare class CloseDisputeDto {
    resolution: string;
}
export declare class DisputeFilterDto {
    status?: DisputeStatus;
    category?: DisputeCategory;
    priority?: DisputePriority;
}
