import { Repository } from 'typeorm';
import { Notification, User } from '../entities';
import { NotificationType } from '../enums/common.enum';
export declare class NotificationsService {
    private notificationRepository;
    private userRepository;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>);
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: Notification[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<import("typeorm").UpdateResult>;
    markAllAsRead(userId: string): Promise<import("typeorm").UpdateResult>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    createNotification(userId: string, type: NotificationType, title: string, message: string, data?: any): Promise<Notification>;
    notifyTransferSent(userId: string, transferReference: string, amount: number): Promise<Notification>;
    notifyTransferCompleted(userId: string, transferReference: string, amount: number): Promise<Notification>;
    notifyTransferFailed(userId: string, transferReference: string, amount: number, reason: string): Promise<Notification>;
    notifyKycApproved(userId: string): Promise<Notification>;
    notifyKycRejected(userId: string, reason: string): Promise<Notification>;
}
