import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            userId: string;
            title: string;
            message: string;
            isRead: boolean;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    createNotification(userId: string, type: string, title: string, message: string, data?: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    notifyTransferSent(userId: string, transferReference: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    notifyTransferCompleted(userId: string, transferReference: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    notifyTransferFailed(userId: string, transferReference: string, amount: number, reason: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    notifyKycApproved(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    notifyKycRejected(userId: string, reason: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
}
