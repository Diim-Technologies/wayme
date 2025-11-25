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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getNotifications(req, page, limit) {
        return this.notificationsService.getUserNotifications(req.user.id, page ? Number(page) : 1, limit ? Number(limit) : 20);
    }
    async getUnreadCount(req) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }
    async markAsRead(req, id) {
        return this.notificationsService.markNotificationAsRead(req.user.id, id);
    }
    async markAllAsRead(req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user notifications with pagination',
        description: 'Retrieve paginated notifications for the authenticated user including transfer updates, system messages, and important alerts.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notifications retrieved successfully',
        example: {
            notifications: [
                {
                    id: 'notif_123',
                    title: 'Transfer Completed',
                    message: 'Your transfer to Jane Doe has been completed successfully',
                    type: 'TRANSFER_COMPLETED',
                    isRead: false,
                    createdAt: '2024-11-14T10:30:00Z',
                    metadata: {
                        transferId: 'transfer_456',
                        amount: 100.00
                    }
                }
            ],
            pagination: {
                currentPage: 1,
                totalPages: 3,
                totalItems: 25,
                itemsPerPage: 20
            }
        }
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        example: 1,
        description: 'Page number for pagination (default: 1)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        example: 20,
        description: 'Number of notifications per page (default: 20, max: 100)'
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get unread notifications count',
        description: 'Get the total count of unread notifications for the authenticated user. Useful for badge displays in UI.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Unread count retrieved successfully',
        example: {
            unreadCount: 5,
            lastChecked: '2024-11-14T12:00:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark specific notification as read',
        description: 'Mark a specific notification as read by its ID. This updates the notification status and reduces the unread count.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Notification ID',
        example: 'notif_123'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification marked as read successfully',
        example: {
            message: 'Notification marked as read',
            notificationId: 'notif_123',
            isRead: true,
            readAt: '2024-11-14T15:30:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found or does not belong to user' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark all notifications as read',
        description: 'Mark all notifications for the authenticated user as read. This is useful for "Mark all as read" functionality in UI.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All notifications marked as read successfully',
        example: {
            message: 'All notifications marked as read',
            markedCount: 15,
            timestamp: '2024-11-14T15:30:00Z'
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired JWT token' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map