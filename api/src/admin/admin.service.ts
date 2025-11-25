import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserRoleDto, AdminStatsDto } from './dto/admin.dto';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private currencyService: CurrencyService,
    private feeService: FeeService,
  ) {}

  async getDashboardStats(): Promise<AdminStatsDto> {
    const [
      totalUsers,
      totalTransfers,
      totalRevenue,
      pendingTransfers,
      completedTransfers,
      failedTransfers,
      pendingKyc,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.transfer.count(),
      this.prisma.transfer.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { fee: true },
      }),
      this.prisma.transfer.count({ where: { status: 'PENDING' } }),
      this.prisma.transfer.count({ where: { status: 'COMPLETED' } }),
      this.prisma.transfer.count({ where: { status: 'FAILED' } }),
      this.prisma.user.count({ where: { kycStatus: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      totalTransfers,
      totalRevenue: totalRevenue._sum.fee?.toNumber() || 0,
      pendingTransfers,
      completedTransfers,
      failedTransfers,
      pendingKyc,
    };
  }

  async getAllUsers(page = 1, limit = 20, role?: string, kycStatus?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (role) where.role = role;
    if (kycStatus) where.kycStatus = kycStatus;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          isVerified: true,
          kycStatus: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getAllTransfers(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;

    const [transfers, total] = await Promise.all([
      this.prisma.transfer.findMany({
        where,
        include: {
          sender: {
            select: { firstName: true, lastName: true, email: true },
          },
          receiver: {
            select: { firstName: true, lastName: true, email: true },
          },
          recipientBank: true,
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transfer.count({ where }),
    ]);

    return {
      transfers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto) {
    const { role } = updateUserRoleDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateKycStatus(userId: string, kycStatus: string, reason?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: kycStatus as any },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send notification based on KYC status
    if (kycStatus === 'APPROVED') {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'KYC_APPROVED',
          title: 'KYC Verification Approved',
          message: 'Your identity verification has been approved. You can now enjoy full access to all Wayame features.',
        },
      });
    } else if (kycStatus === 'REJECTED') {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'KYC_REJECTED',
          title: 'KYC Verification Rejected',
          message: `Your identity verification was rejected. ${reason ? `Reason: ${reason}` : ''} Please update your documents and try again.`,
          data: { reason },
        },
      });
    }

    return updatedUser;
  }

  async updateTransferStatus(transferId: string, status: string, reason?: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: { sender: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    const updateData: any = { status };
    
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (status === 'PROCESSING') {
      updateData.processedAt = new Date();
    }

    const updatedTransfer = await this.prisma.transfer.update({
      where: { id: transferId },
      data: updateData,
      include: {
        sender: {
          select: { firstName: true, lastName: true, email: true },
        },
        receiver: {
          select: { firstName: true, lastName: true, email: true },
        },
        recipientBank: true,
      },
    });

    // Create notification for transfer status update
    const amount = transfer.amount.toNumber() * 100; // Convert to kobo
    if (status === 'COMPLETED') {
      await this.prisma.notification.create({
        data: {
          userId: transfer.senderId,
          type: 'TRANSFER_COMPLETED',
          title: 'Transfer Completed',
          message: `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transfer.reference} has been completed successfully.`,
          data: { transferId, reference: transfer.reference, amount },
        },
      });
    } else if (status === 'FAILED') {
      await this.prisma.notification.create({
        data: {
          userId: transfer.senderId,
          type: 'TRANSFER_FAILED',
          title: 'Transfer Failed',
          message: `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transfer.reference} has failed. ${reason ? `Reason: ${reason}` : ''}`,
          data: { transferId, reference: transfer.reference, amount, reason },
        },
      });
    }

    return updatedTransfer;
  }

  async deactivateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot deactivate super admin user');
    }

    // Deactivate all user's payment methods
    await this.prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Cancel all pending transfers
    await this.prisma.transfer.updateMany({
      where: {
        senderId: userId,
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' },
    });

    return { message: 'User deactivated successfully', userId };
  }

  async getSystemLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    // This is a simplified version - in a real system, you'd have a dedicated logs table
    const [recentTransfers, recentUsers] = await Promise.all([
      this.prisma.transfer.findMany({
        select: {
          id: true,
          reference: true,
          status: true,
          amount: true,
          createdAt: true,
          sender: { select: { email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit / 2,
        skip: skip / 2,
      }),
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit / 2,
        skip: skip / 2,
      }),
    ]);

    const logs = [
      ...recentTransfers.map(t => ({
        type: 'TRANSFER',
        action: `Transfer ${t.status.toLowerCase()}`,
        details: `${t.sender.firstName} ${t.sender.lastName} - ₦${t.amount.toNumber().toLocaleString()}`,
        reference: t.reference,
        timestamp: t.createdAt,
      })),
      ...recentUsers.map(u => ({
        type: 'USER',
        action: 'User registered',
        details: `${u.firstName} ${u.lastName} (${u.email})`,
        reference: u.id,
        timestamp: u.createdAt,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      logs: logs.slice(0, limit),
      pagination: {
        currentPage: page,
        totalItems: logs.length,
        itemsPerPage: limit,
      },
    };
  }

  // Exchange Rate Management
  async getAllExchangeRates() {
    return this.currencyService.getAllExchangeRates();
  }

  async updateExchangeRate(fromCurrency: string, toCurrency: string, data: {
    rate: number;
    buyRate?: number;
    sellRate?: number;
  }) {
    return this.currencyService.manualRateUpdate(
      fromCurrency,
      toCurrency,
      data.rate,
      data.buyRate,
      data.sellRate
    );
  }

  async deactivateExchangeRate(fromCurrency: string, toCurrency: string) {
    return this.prisma.exchangeRate.update({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency,
          toCurrency,
        },
      },
      data: { isActive: false },
    });
  }

  async refreshExchangeRates() {
    await this.currencyService.fetchAndUpdateRates();
    return { message: 'Exchange rates updated successfully' };
  }

  // Fee Configuration Management
  async getAllFeeConfigurations() {
    return this.feeService.getAllFeeConfigurations();
  }

  async createFeeConfiguration(data: {
    name: string;
    type: string;
    percentage?: number;
    fixedAmount?: number;
    minimumFee?: number;
    maximumFee?: number;
    currency?: string;
    applicableTo?: string[];
  }) {
    return this.feeService.createFeeConfiguration(data);
  }

  async updateFeeConfiguration(id: string, data: {
    percentage?: number;
    fixedAmount?: number;
    minimumFee?: number;
    maximumFee?: number;
    applicableTo?: string[];
    isActive?: boolean;
  }) {
    return this.feeService.updateFeeConfiguration(id, data);
  }

  async deleteFeeConfiguration(id: string) {
    const feeConfig = await this.prisma.feeConfiguration.findUnique({
      where: { id },
    });

    if (!feeConfig) {
      throw new NotFoundException('Fee configuration not found');
    }

    return this.prisma.feeConfiguration.delete({
      where: { id },
    });
  }

  // System Settings Management
  async getSystemSettings() {
    return this.prisma.systemSetting.findMany({
      where: { isActive: true },
      orderBy: { key: 'asc' },
    });
  }

  async updateSystemSetting(key: string, value: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        description: `System setting for ${key}`,
      },
    });
  }

  async createSystemSetting(data: {
    key: string;
    value: string;
    description?: string;
    type?: string;
  }) {
    return this.prisma.systemSetting.create({
      data,
    });
  }
}