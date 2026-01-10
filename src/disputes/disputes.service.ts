import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Dispute, DisputeMessage, Transaction, User } from '../entities';
import { DisputeStatus, DisputePriority } from '../enums/dispute.enum';
import { UserRole } from '../enums/user.enum';
import { EmailService } from '../common/services/email.service';
import { CreateDisputeDto, ReplyDisputeDto, UpdateDisputeStatusDto, CloseDisputeDto, DisputeFilterDto } from './dto/disputes.dto';

@Injectable()
export class DisputesService {
    constructor(
        @InjectRepository(Dispute)
        private disputeRepository: Repository<Dispute>,
        @InjectRepository(DisputeMessage)
        private disputeMessageRepository: Repository<DisputeMessage>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private dataSource: DataSource,
        private emailService: EmailService,
    ) { }

    async createDispute(userId: string, createDisputeDto: CreateDisputeDto) {
        const { transactionId, category, subject, description, priority } = createDisputeDto;

        // Verify transaction exists and belongs to user
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['transfer'],
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        // Check if user is related to this transaction
        if (transaction.transfer.senderId !== userId && transaction.transfer.receiverId !== userId) {
            throw new ForbiddenException('You can only create disputes for your own transactions');
        }

        // Check if dispute already exists for this transaction
        const existingDispute = await this.disputeRepository.findOne({
            where: { transactionId, status: DisputeStatus.OPEN },
        });

        if (existingDispute) {
            throw new BadRequestException('An open dispute already exists for this transaction');
        }

        // Create dispute
        const dispute = this.disputeRepository.create({
            transactionId,
            userId,
            category,
            subject,
            description,
            priority: priority || DisputePriority.MEDIUM,
            status: DisputeStatus.OPEN,
        });

        const savedDispute = await this.disputeRepository.save(dispute);

        // Get user details for email
        const user = await this.userRepository.findOne({ where: { id: userId } });

        // Send email notification
        try {
            await this.emailService.sendDisputeCreatedNotification(
                user.email,
                savedDispute.id,
                subject,
                user.firstName,
            );
        } catch (error) {
            console.log('Failed to send dispute creation email:', error);
        }

        return savedDispute;
    }

    async getMyDisputes(userId: string, page = 1, limit = 20, filters?: DisputeFilterDto) {
        const skip = (page - 1) * limit;
        const where: any = { userId };

        if (filters?.status) where.status = filters.status;
        if (filters?.category) where.category = filters.category;
        if (filters?.priority) where.priority = filters.priority;

        const [disputes, total] = await this.disputeRepository.findAndCount({
            where,
            relations: ['transaction', 'messages', 'messages.user'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            disputes: disputes.map(dispute => ({
                ...dispute,
                messageCount: dispute.messages?.length || 0,
                lastMessageAt: dispute.messages?.[dispute.messages.length - 1]?.createdAt || dispute.createdAt,
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }

    async getDisputeById(disputeId: string, userId: string, isAdmin = false) {
        const dispute = await this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['transaction', 'user', 'messages', 'messages.user', 'resolver'],
        });

        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        // Check permissions
        if (!isAdmin && dispute.userId !== userId) {
            throw new ForbiddenException('You can only view your own disputes');
        }

        return dispute;
    }

    async replyToDispute(disputeId: string, userId: string, replyDto: ReplyDisputeDto, isAdmin = false) {
        const dispute = await this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['user'],
        });

        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        // Check if dispute is closed
        if (dispute.status === DisputeStatus.CLOSED) {
            throw new BadRequestException('Cannot reply to a closed dispute');
        }

        // Check permissions
        if (!isAdmin && dispute.userId !== userId) {
            throw new ForbiddenException('You can only reply to your own disputes');
        }

        // Create message
        const message = this.disputeMessageRepository.create({
            disputeId,
            userId,
            message: replyDto.message,
            isAdminReply: isAdmin,
            attachments: replyDto.attachments || [],
        });

        const savedMessage = await this.disputeMessageRepository.save(message);

        // Update dispute status if it's the first admin reply
        if (isAdmin && dispute.status === DisputeStatus.OPEN) {
            await this.disputeRepository.update(
                { id: disputeId },
                { status: DisputeStatus.IN_PROGRESS },
            );
        }

        // Send email notification
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const recipientEmail = isAdmin ? dispute.user.email : user.email;

        try {
            await this.emailService.sendDisputeReplyNotification(
                recipientEmail,
                disputeId,
                user.firstName,
                isAdmin,
            );
        } catch (error) {
            console.log('Failed to send dispute reply email:', error);
        }

        return savedMessage;
    }

    async getAllDisputes(page = 1, limit = 20, filters?: DisputeFilterDto) {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (filters?.status) where.status = filters.status;
        if (filters?.category) where.category = filters.category;
        if (filters?.priority) where.priority = filters.priority;

        const [disputes, total] = await this.disputeRepository.findAndCount({
            where,
            relations: ['transaction', 'user', 'messages', 'resolver'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            disputes: disputes.map(dispute => ({
                ...dispute,
                messageCount: dispute.messages?.length || 0,
                lastMessageAt: dispute.messages?.[dispute.messages.length - 1]?.createdAt || dispute.createdAt,
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }

    async updateDisputeStatus(disputeId: string, updateDto: UpdateDisputeStatusDto, adminId: string) {
        const dispute = await this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['user'],
        });

        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        await this.disputeRepository.update(
            { id: disputeId },
            { status: updateDto.status },
        );

        // Send email notification
        try {
            await this.emailService.sendDisputeStatusUpdateNotification(
                dispute.user.email,
                disputeId,
                updateDto.status,
                dispute.user.firstName,
            );
        } catch (error) {
            console.log('Failed to send status update email:', error);
        }

        return this.disputeRepository.findOne({ where: { id: disputeId } });
    }

    async closeDispute(disputeId: string, closeDto: CloseDisputeDto, adminId: string) {
        const dispute = await this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['user'],
        });

        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        if (dispute.status === DisputeStatus.CLOSED) {
            throw new BadRequestException('Dispute is already closed');
        }

        // Update dispute
        await this.dataSource.transaction(async (manager) => {
            await manager.update(Dispute, { id: disputeId }, {
                status: DisputeStatus.CLOSED,
                resolvedAt: new Date(),
                resolvedBy: adminId,
            });

            // Add resolution message
            const resolutionMessage = manager.create(DisputeMessage, {
                disputeId,
                userId: adminId,
                message: closeDto.resolution,
                isAdminReply: true,
            });
            await manager.save(DisputeMessage, resolutionMessage);
        });

        // Send email notification
        try {
            await this.emailService.sendDisputeClosedNotification(
                dispute.user.email,
                disputeId,
                closeDto.resolution,
                dispute.user.firstName,
            );
        } catch (error) {
            console.log('Failed to send dispute closed email:', error);
        }

        return this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['messages', 'resolver'],
        });
    }
}
