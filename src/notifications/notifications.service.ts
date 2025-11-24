import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string, page = 1, limit = 20) {
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

  async markNotificationAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
        data,
      },
    });
  }

  // Helper methods for creating specific notification types
  async notifyTransferSent(userId: string, transferReference: string, amount: number) {
    return this.createNotification(
      userId,
      'TRANSFER_SENT',
      'Transfer Initiated',
      `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has been initiated.`,
      { transferReference, amount },
    );
  }

  async notifyTransferCompleted(userId: string, transferReference: string, amount: number) {
    return this.createNotification(
      userId,
      'TRANSFER_COMPLETED',
      'Transfer Completed',
      `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has been completed successfully.`,
      { transferReference, amount },
    );
  }

  async notifyTransferFailed(userId: string, transferReference: string, amount: number, reason: string) {
    return this.createNotification(
      userId,
      'TRANSFER_FAILED',
      'Transfer Failed',
      `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has failed. Reason: ${reason}`,
      { transferReference, amount, reason },
    );
  }

  async notifyKycApproved(userId: string) {
    return this.createNotification(
      userId,
      'KYC_APPROVED',
      'KYC Verification Approved',
      'Your identity verification has been approved. You can now enjoy full access to all Wayame features.',
    );
  }

  async notifyKycRejected(userId: string, reason: string) {
    return this.createNotification(
      userId,
      'KYC_REJECTED',
      'KYC Verification Rejected',
      `Your identity verification was rejected. Reason: ${reason}. Please update your documents and try again.`,
      { reason },
    );
  }
}