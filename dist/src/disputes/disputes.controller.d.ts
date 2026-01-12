import { DisputesService } from './disputes.service';
import { CreateDisputeDto, ReplyDisputeDto, UpdateDisputeStatusDto, CloseDisputeDto, DisputeFilterDto } from './dto/disputes.dto';
export declare class DisputesController {
    private disputesService;
    constructor(disputesService: DisputesService);
    createDispute(req: any, createDisputeDto: CreateDisputeDto): Promise<import("../entities").Dispute>;
    getMyDisputes(req: any, page?: number, limit?: number, filters?: DisputeFilterDto): Promise<{
        disputes: {
            messageCount: number;
            lastMessageAt: Date;
            id: string;
            transactionId: string;
            userId: string;
            category: import("../enums/dispute.enum").DisputeCategory;
            status: import("../enums/dispute.enum").DisputeStatus;
            subject: string;
            description: string;
            priority: import("../enums/dispute.enum").DisputePriority;
            resolvedAt: Date;
            resolvedBy: string;
            createdAt: Date;
            updatedAt: Date;
            user: import("../entities").User;
            transaction: import("../entities").Transaction;
            resolver: import("../entities").User;
            messages: import("../entities").DisputeMessage[];
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getDisputeById(req: any, disputeId: string): Promise<import("../entities").Dispute>;
    replyToDispute(req: any, disputeId: string, replyDto: ReplyDisputeDto): Promise<import("../entities").DisputeMessage>;
}
export declare class AdminDisputesController {
    private disputesService;
    constructor(disputesService: DisputesService);
    getAllDisputes(page?: number, limit?: number, filters?: DisputeFilterDto): Promise<{
        disputes: {
            messageCount: number;
            lastMessageAt: Date;
            id: string;
            transactionId: string;
            userId: string;
            category: import("../enums/dispute.enum").DisputeCategory;
            status: import("../enums/dispute.enum").DisputeStatus;
            subject: string;
            description: string;
            priority: import("../enums/dispute.enum").DisputePriority;
            resolvedAt: Date;
            resolvedBy: string;
            createdAt: Date;
            updatedAt: Date;
            user: import("../entities").User;
            transaction: import("../entities").Transaction;
            resolver: import("../entities").User;
            messages: import("../entities").DisputeMessage[];
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getDisputeById(req: any, disputeId: string): Promise<import("../entities").Dispute>;
    replyToDispute(req: any, disputeId: string, replyDto: ReplyDisputeDto): Promise<import("../entities").DisputeMessage>;
    updateDisputeStatus(req: any, disputeId: string, updateDto: UpdateDisputeStatusDto): Promise<import("../entities").Dispute>;
    closeDispute(req: any, disputeId: string, closeDto: CloseDisputeDto): Promise<import("../entities").Dispute>;
}
