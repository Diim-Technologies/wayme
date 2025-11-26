import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, User } from '../entities';
import { NotificationType } from '../enums/common.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserNotifications(userId: string, page = 1, limit = 20) {
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

  async markNotificationAsRead(userId: string, notificationId: string) {
    return this.notificationRepository.update(
      {
        id: notificationId,
        userId,
      },
      { isRead: true }
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.update(
      {
        userId,
        isRead: false,
      },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ) {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      data,
    });

    return this.notificationRepository.save(notification);
  }

  // Helper methods for creating specific notification types
  async notifyTransferSent(userId: string, transferReference: string, amount: number) {
    return this.createNotification(
      userId,
      NotificationType.TRANSFER_SENT,
      'Transfer Initiated',
      `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has been initiated.`,
      { transferReference, amount },
    );
  }

  async notifyTransferCompleted(userId: string, transferReference: string, amount: number) {
    return this.createNotification(
      userId,
      NotificationType.TRANSFER_COMPLETED,
      'Transfer Completed',
      `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has been completed successfully.`,
      { transferReference, amount },
    );
  }

  async notifyTransferFailed(userId: string, transferReference: string, amount: number, reason: string) {
    return this.createNotification(
      userId,
      NotificationType.TRANSFER_FAILED,
      'Transfer Failed',
      `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transferReference} has failed. Reason: ${reason}`,
      { transferReference, amount, reason },
    );
  }

  async notifyKycApproved(userId: string) {
    return this.createNotification(
      userId,
      NotificationType.KYC_APPROVED,
      'KYC Verification Approved',
      'Your identity verification has been approved. You can now enjoy full access to all Wayame features.',
    );
  }

  async notifyKycRejected(userId: string, reason: string) {
    return this.createNotification(
      userId,
      NotificationType.KYC_REJECTED,
      'KYC Verification Rejected',
      `Your identity verification was rejected. Reason: ${reason}. Please update your documents and try again.`,
      { reason },
    );
  }
}