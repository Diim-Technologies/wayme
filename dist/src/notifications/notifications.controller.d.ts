import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, page?: number, limit?: number): Promise<{
        notifications: import("../entities").Notification[];
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
    markAsRead(req: any, id: string): Promise<import("typeorm").UpdateResult>;
    markAllAsRead(req: any): Promise<import("typeorm").UpdateResult>;
}
