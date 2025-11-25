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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({
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
        return this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
            },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: { isRead: true },
        });
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
        return { unreadCount: count };
    }
    async createNotification(userId, type, title, message, data) {
        return this.prisma.notification.create({
            data: {
                userId,
                type: type,
                title,
                message,
                data,
            },
        });
    }
    async notifyTransferSent(userId, transferReference, amount) {
        return this.createNotification(userId, 'TRANSFER_SENT', 'Transfer Initiated', `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has been initiated.`, { transferReference, amount });
    }
    async notifyTransferCompleted(userId, transferReference, amount) {
        return this.createNotification(userId, 'TRANSFER_COMPLETED', 'Transfer Completed', `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has been completed successfully.`, { transferReference, amount });
    }
    async notifyTransferFailed(userId, transferReference, amount, reason) {
        return this.createNotification(userId, 'TRANSFER_FAILED', 'Transfer Failed', `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has failed. Reason: ${reason}`, { transferReference, amount, reason });
    }
    async notifyKycApproved(userId) {
        return this.createNotification(userId, 'KYC_APPROVED', 'KYC Verification Approved', 'Your identity verification has been approved. You can now enjoy full access to all Wayame features.');
    }
    async notifyKycRejected(userId, reason) {
        return this.createNotification(userId, 'KYC_REJECTED', 'KYC Verification Rejected', `Your identity verification was rejected. Reason: ${reason}. Please update your documents and try again.`, { reason });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map