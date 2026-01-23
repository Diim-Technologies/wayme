import { Repository, DataSource } from 'typeorm';
import { Dispute, DisputeMessage, Transfer, User } from '../entities';
import { DisputeStatus, DisputePriority } from '../enums/dispute.enum';
import { EmailService } from '../common/services/email.service';
import { CreateDisputeDto, ReplyDisputeDto, UpdateDisputeStatusDto, CloseDisputeDto, DisputeFilterDto } from './dto/disputes.dto';
export declare class DisputesService {
    private disputeRepository;
    private disputeMessageRepository;
    private transferRepository;
    private userRepository;
    private dataSource;
    private emailService;
    constructor(disputeRepository: Repository<Dispute>, disputeMessageRepository: Repository<DisputeMessage>, transferRepository: Repository<Transfer>, userRepository: Repository<User>, dataSource: DataSource, emailService: EmailService);
    createDispute(userId: string, createDisputeDto: CreateDisputeDto): Promise<Dispute>;
    getMyDisputes(userId: string, page?: number, limit?: number, filters?: DisputeFilterDto): Promise<{
        disputes: {
            messageCount: number;
            lastMessageAt: Date;
            id: string;
            transferId: string;
            userId: string;
            category: import("../enums/dispute.enum").DisputeCategory;
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
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getDisputeById(disputeId: string, userId: string, isAdmin?: boolean): Promise<Dispute>;
    replyToDispute(disputeId: string, userId: string, replyDto: ReplyDisputeDto, isAdmin?: boolean): Promise<DisputeMessage>;
    getAllDisputes(page?: number, limit?: number, filters?: DisputeFilterDto): Promise<{
        disputes: {
            messageCount: number;
            lastMessageAt: Date;
            id: string;
            transferId: string;
            userId: string;
            category: import("../enums/dispute.enum").DisputeCategory;
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
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    updateDisputeStatus(disputeId: string, updateDto: UpdateDisputeStatusDto, adminId: string): Promise<Dispute>;
    closeDispute(disputeId: string, closeDto: CloseDisputeDto, adminId: string): Promise<Dispute>;
}
