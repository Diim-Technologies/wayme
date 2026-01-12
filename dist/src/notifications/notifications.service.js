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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const common_enum_1 = require("../enums/common.enum");
let NotificationsService = class NotificationsService {
    constructor(notificationRepository, userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.notificationRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            }),
            this.notificationRepository.count({
                where: { userId },
            }),
        ]);
        return {
            notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }
    async markNotificationAsRead(userId, notificationId) {
        return this.notificationRepository.update({
            id: notificationId,
            userId,
        }, { isRead: true });
    }
    async markAllAsRead(userId) {
        return this.notificationRepository.update({
            userId,
            isRead: false,
        }, { isRead: true });
    }
    async getUnreadCount(userId) {
        const count = await this.notificationRepository.count({
            where: {
                userId,
                isRead: false,
            },
        });
        return { unreadCount: count };
    }
    async createNotification(userId, type, title, message, data) {
        const notification = this.notificationRepository.create({
            userId,
            type,
            title,
            message,
            data,
        });
        return this.notificationRepository.save(notification);
    }
    async notifyTransferSent(userId, transferReference, amount) {
        return this.createNotification(userId, common_enum_1.NotificationType.TRANSFER_SENT, 'Transfer Initiated', `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has been initiated.`, { transferReference, amount });
    }
    async notifyTransferCompleted(userId, transferReference, amount) {
        return this.createNotification(userId, common_enum_1.NotificationType.TRANSFER_COMPLETED, 'Transfer Completed', `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has been completed successfully.`, { transferReference, amount });
    }
    async notifyTransferFailed(userId, transferReference, amount, reason) {
        return this.createNotification(userId, common_enum_1.NotificationType.TRANSFER_FAILED, 'Transfer Failed', `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has failed. Reason: ${reason}`, { transferReference, amount, reason });
    }
    async notifyKycApproved(userId) {
        return this.createNotification(userId, common_enum_1.NotificationType.KYC_APPROVED, 'KYC Verification Approved', 'Your identity verification has been approved. You can now enjoy full access to all Wayame features.');
    }
    async notifyKycRejected(userId, reason) {
        return this.createNotification(userId, common_enum_1.NotificationType.KYC_REJECTED, 'KYC Verification Rejected', `Your identity verification was rejected. Reason: ${reason}. Please update your documents and try again.`, { reason });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map