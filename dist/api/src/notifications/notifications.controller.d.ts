import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, page?: number, limit?: number): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            message: string;
            title: string;
            userId: string;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markAsRead(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
