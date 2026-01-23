"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const dispute_enum_1 = require("../enums/dispute.enum");
const email_service_1 = require("../common/services/email.service");
let DisputesService = class DisputesService {
    constructor(disputeRepository, disputeMessageRepository, transferRepository, userRepository, dataSource, emailService) {
        this.disputeRepository = disputeRepository;
        this.disputeMessageRepository = disputeMessageRepository;
        this.transferRepository = transferRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
        this.emailService = emailService;
    }
    async createDispute(userId, createDisputeDto) {
        let { transferId, category, subject, description, priority } = createDisputeDto;
        let transfer = null;
        if (/^[0-9a-fA-F-]{36}$/.test(transferId)) {
            transfer = await this.transferRepository.findOne({
                where: { id: transferId },
            });
        }
        else {
            transfer = await this.transferRepository.findOne({
                where: { reference: transferId },
            });
            if (transfer) {
                transferId = transfer.id;
            }
        }
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        if (transfer.senderId !== userId && transfer.receiverId !== userId) {
            throw new common_1.ForbiddenException('You can only create disputes for your own transfers');
        }
        const existingDispute = await this.disputeRepository.findOne({
            where: { transferId, status: dispute_enum_1.DisputeStatus.OPEN },
        });
        if (existingDispute) {
            throw new common_1.BadRequestException('An open dispute already exists for this transfer');
        }
        const dispute = this.disputeRepository.create({
            transferId,
            userId,
            category,
            subject,
            description,
            priority: priority || dispute_enum_1.DisputePriority.MEDIUM,
            status: dispute_enum_1.DisputeStatus.OPEN,
        });
        const savedDispute = await this.disputeRepository.save(dispute);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        try {
            await this.emailService.sendDisputeCreatedNotification(user.email, savedDispute.id, subject, user.firstName);
        }
        catch (error) {
            console.log('Failed to send dispute creation email:', error);
        }
        return savedDispute;
    }
    async getMyDisputes(userId, page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.category)
            where.category = filters.category;
        if (filters?.priority)
            where.priority = filters.priority;
        const [disputes, total] = await this.disputeRepository.findAndCount({
            where,
            relations: ['transfer', 'messages', 'messages.user'],
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
    async getDisputeById(disputeId, userId, isAdmin = false) {
        const dispute = await this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['transfer', 'user', 'messages', 'messages.user', 'resolver'],
        });
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        if (!isAdmin && dispute.userId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own disputes');
        }
        return dispute;
    }
    async replyToDispute(disputeId, userId, replyDto, isAdmin = false) {
        const dispute = await this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['user'],
        });
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        if (dispute.status === dispute_enum_1.DisputeStatus.CLOSED) {
            throw new common_1.BadRequestException('Cannot reply to a closed dispute');
        }
        if (!isAdmin && dispute.userId !== userId) {
            throw new common_1.ForbiddenException('You can only reply to your own disputes');
        }
        const message = this.disputeMessageRepository.create({
            disputeId,
            userId,
            message: replyDto.message,
            isAdminReply: isAdmin,
            attachments: replyDto.attachments || [],
        });
        const savedMessage = await this.disputeMessageRepository.save(message);
        if (isAdmin && dispute.status === dispute_enum_1.DisputeStatus.OPEN) {
            await this.disputeRepository.update({ id: disputeId }, { status: dispute_enum_1.DisputeStatus.IN_PROGRESS });
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const recipientEmail = isAdmin ? dispute.user.email : user.email;
        try {
            await this.emailService.sendDisputeReplyNotification(recipientEmail, disputeId, user.firstName, isAdmin);
        }
        catch (error) {
            console.log('Failed to send dispute reply email:', error);
        }
        return savedMessage;
    }
    async getAllDisputes(page = 1, limit = 20, filters) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.status)
            where.status = filters.status;
        if (filters?.category)
            where.category = filters.category;
        if (filters?.priority)
            where.priority = filters.priority;
        const [disputes, total] = await this.disputeRepository.findAndCount({
            where,
            relations: ['transfer', 'user', 'messages', 'resolver'],
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
    async updateDisputeStatus(disputeId, updateDto, adminId) {
        const dispute = await this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['user'],
        });
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        await this.disputeRepository.update({ id: disputeId }, { status: updateDto.status });
        try {
            await this.emailService.sendDisputeStatusUpdateNotification(dispute.user.email, disputeId, updateDto.status, dispute.user.firstName);
        }
        catch (error) {
            console.log('Failed to send status update email:', error);
        }
        return this.disputeRepository.findOne({ where: { id: disputeId } });
    }
    async closeDispute(disputeId, closeDto, adminId) {
        const dispute = await this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['user'],
        });
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        if (dispute.status === dispute_enum_1.DisputeStatus.CLOSED) {
            throw new common_1.BadRequestException('Dispute is already closed');
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.Dispute, { id: disputeId }, {
                status: dispute_enum_1.DisputeStatus.CLOSED,
                resolvedAt: new Date(),
                resolvedBy: adminId,
            });
            const resolutionMessage = manager.create(entities_1.DisputeMessage, {
                disputeId,
                userId: adminId,
                message: closeDto.resolution,
                isAdminReply: true,
            });
            await manager.save(entities_1.DisputeMessage, resolutionMessage);
        });
        try {
            await this.emailService.sendDisputeClosedNotification(dispute.user.email, disputeId, closeDto.resolution, dispute.user.firstName);
        }
        catch (error) {
            console.log('Failed to send dispute closed email:', error);
        }
        return this.disputeRepository.findOne({
            where: { id: disputeId },
            relations: ['messages', 'resolver'],
        });
    }
};
exports.DisputesService = DisputesService;
exports.DisputesService = DisputesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Dispute)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.DisputeMessage)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Transfer)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        email_service_1.EmailService])
], DisputesService);
//# sourceMappingURL=disputes.service.js.map