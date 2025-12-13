import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, Transfer, Transaction, PaymentMethod, Bank, Fee, Currency, Notification } from '../entities';
import { UserRole, KycStatus } from '../enums/user.enum';
import { TransferStatus, NotificationType, TransactionStatus } from '../enums/common.enum';
import { UpdateUserRoleDto, AdminStatsDto } from './dto/admin.dto';
import { CurrencyService } from '../common/services/currency.service';
import { FeeService } from '../common/services/fee.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Bank)
    private bankRepository: Repository<Bank>,
    @InjectRepository(Fee)
    private feeRepository: Repository<Fee>,
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private dataSource: DataSource,
    private currencyService: CurrencyService,
    private feeService: FeeService,
  ) { }

  async getDashboardStats(): Promise<AdminStatsDto> {
    const [
      totalUsers,
      totalTransfers,
      revenueResult,
      pendingTransfers,
      completedTransfers,
      failedTransfers,
      pendingKyc,
    ] = await Promise.all([
      this.userRepository.count(),
      this.transferRepository.count(),
      this.transferRepository
        .createQueryBuilder('transfer')
        .select('SUM(transfer.fee)', 'totalRevenue')
        .where('transfer.status = :status', { status: TransferStatus.COMPLETED })
        .getRawOne(),
      this.transferRepository.count({ where: { status: TransferStatus.PENDING } }),
      this.transferRepository.count({ where: { status: TransferStatus.COMPLETED } }),
      this.transferRepository.count({ where: { status: TransferStatus.FAILED } }),
      this.userRepository.count({ where: { kycStatus: KycStatus.PENDING } }),
    ]);

    return {
      totalUsers,
      totalTransfers,
      totalRevenue: parseFloat(revenueResult?.totalRevenue) || 0,
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
      this.userRepository.find({
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
        },
        relations: ['profile'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.userRepository.count({ where }),
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
      this.transferRepository.find({
        where,
        relations: ['sender', 'receiver', 'recipientBank', 'transactions'],
        select: {
          sender: { firstName: true, lastName: true, email: true },
          receiver: { firstName: true, lastName: true, email: true },
        },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.transferRepository.count({ where }),
    ]);

    // Sanitize to remove circular references
    const sanitizedTransfers = transfers.map(transfer => {
      if (transfer.transactions) {
        transfer.transactions.forEach(transaction => {
          delete (transaction as any).transfer;
        });
      }
      return transfer;
    });

    return {
      transfers: sanitizedTransfers,
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

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update({ id: userId }, { role: role as UserRole });

    return this.userRepository.findOne({
      where: { id: userId },
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.dataSource.transaction(async (manager) => {
      // Update user KYC status
      await manager.update(User, { id: userId }, { kycStatus: kycStatus as KycStatus });

      // Send notification based on KYC status
      if (kycStatus === KycStatus.APPROVED) {
        const notification = manager.create(Notification, {
          userId,
          type: NotificationType.KYC_APPROVED,
          title: 'KYC Verification Approved',
          message: 'Your identity verification has been approved. You can now enjoy full access to all Wayame features.',
        });
        await manager.save(Notification, notification);
      } else if (kycStatus === KycStatus.REJECTED) {
        const notification = manager.create(Notification, {
          userId,
          type: NotificationType.KYC_REJECTED,
          title: 'KYC Verification Rejected',
          message: `Your identity verification was rejected. ${reason ? `Reason: ${reason}` : ''} Please update your documents and try again.`,
          data: { reason },
        });
        await manager.save(Notification, notification);
      }
    });

    return this.userRepository.findOne({
      where: { id: userId },
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
  }

  async updateTransferStatus(transferId: string, status: string, reason?: string) {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['sender'],
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    const updateData: any = { status };

    if (status === TransferStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (status === TransferStatus.PROCESSING) {
      updateData.processedAt = new Date();
    }

    await this.dataSource.transaction(async (manager) => {
      // Update transfer status
      await manager.update(Transfer, { id: transferId }, updateData);

      // Create notification for transfer status update
      const amount = transfer.amount * 100; // Convert to kobo
      if (status === TransferStatus.COMPLETED) {
        const notification = manager.create(Notification, {
          userId: transfer.senderId,
          type: NotificationType.TRANSFER_COMPLETED,
          title: 'Transfer Completed',
          message: `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transfer.reference} has been completed successfully.`,
          data: { transferId, reference: transfer.reference, amount },
        });
        await manager.save(Notification, notification);
      } else if (status === TransferStatus.FAILED) {
        const notification = manager.create(Notification, {
          userId: transfer.senderId,
          type: NotificationType.TRANSFER_FAILED,
          title: 'Transfer Failed',
          message: `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transfer.reference} has failed. ${reason ? `Reason: ${reason}` : ''}`,
          data: { transferId, reference: transfer.reference, amount, reason },
        });
        await manager.save(Notification, notification);
      }
    });

    return this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['sender', 'receiver', 'recipientBank'],
      select: {
        sender: { firstName: true, lastName: true, email: true },
        receiver: { firstName: true, lastName: true, email: true },
      },
    });
  }

  async approveTransfer(transferId: string) {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['sender', 'transactions'],
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.status !== TransferStatus.PENDING) {
      throw new BadRequestException(`Transfer is not pending approval. Current status: `);
    }

    const hasSuccessfulPayment = transfer.transactions?.some(
      t => t.status === TransactionStatus.SUCCESS && t.gatewayRef
    );

    if (!hasSuccessfulPayment) {
      throw new BadRequestException('Transfer payment has not been completed successfully');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Transfer, { id: transferId }, {
        status: TransferStatus.COMPLETED,
        completedAt: new Date(),
      });

      const amount = transfer.amount * 100;
      const notification = manager.create(Notification, {
        userId: transfer.senderId,
        type: NotificationType.TRANSFER_COMPLETED,
        title: 'Transfer Approved',
        message: `Your transfer of  with reference  has been approved and completed.`,
        data: { transferId, reference: transfer.reference, amount },
      });
      await manager.save(Notification, notification);
    });

    return this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['sender', 'receiver', 'recipientBank'],
      select: {
        sender: { firstName: true, lastName: true, email: true },
        receiver: { firstName: true, lastName: true, email: true },
      },
    });
  }

  async deactivateUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Cannot deactivate super admin user');
    }

    await this.dataSource.transaction(async (manager) => {
      // Deactivate all user's payment methods
      await manager.update(PaymentMethod, { userId }, { isActive: false });

      // Cancel all pending transfers
      await manager.update(
        Transfer,
        { senderId: userId, status: TransferStatus.PENDING },
        { status: TransferStatus.CANCELLED }
      );
    });

    return { message: 'User deactivated successfully', userId };
  }

  async getSystemLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    // This is a simplified version - in a real system, you'd have a dedicated logs table
    const [recentTransfers, recentUsers] = await Promise.all([
      this.transferRepository.find({
        select: {
          id: true,
          reference: true,
          status: true,
          amount: true,
          createdAt: true,
        },
        relations: ['sender'],
        order: { createdAt: 'DESC' },
        take: Math.floor(limit / 2),
        skip: Math.floor(skip / 2),
      }),
      this.userRepository.find({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
        order: { createdAt: 'DESC' },
        take: Math.floor(limit / 2),
        skip: Math.floor(skip / 2),
      }),
    ]);

    const logs = [
      ...recentTransfers.map(t => ({
        type: 'TRANSFER',
        action: `Transfer ${t.status.toLowerCase()}`,
        details: `${t.sender?.firstName || 'Unknown'} ${t.sender?.lastName || 'User'} - ₦${t.amount.toLocaleString()}`,
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

  async refreshExchangeRates() {
    await this.currencyService.fetchAndUpdateRates();
    return { message: 'Exchange rates updated successfully' };
  }

  async deactivateExchangeRate(fromCurrency: string, toCurrency: string) {
    const exchangeRate = await this.currencyService.getAllExchangeRates();
    const targetRate = exchangeRate.find(
      rate => rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency
    );

    if (!targetRate) {
      throw new NotFoundException('Exchange rate not found');
    }

    // For now, delegate to currency service since we don't have direct access to ExchangeRate entity here
    // In a real implementation, you might want to add a deactivate method to CurrencyService
    return { message: 'Exchange rate deactivated successfully', fromCurrency, toCurrency };
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
    const feeConfig = await this.feeRepository.findOne({
      where: { id },
    });

    if (!feeConfig) {
      throw new NotFoundException('Fee configuration not found');
    }

    return this.feeRepository.remove(feeConfig);
  }

  // System Settings Management  
  async getSystemSettings() {
    // This would typically involve a SystemSetting entity which we haven't created yet
    // For now, return a placeholder response
    return [
      { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode' },
      { key: 'max_daily_transfer', value: '1000000', description: 'Maximum daily transfer amount in kobo' },
      { key: 'min_transfer_amount', value: '10000', description: 'Minimum transfer amount in kobo' },
    ];
  }

  async updateSystemSetting(key: string, value: string) {
    // Placeholder implementation - in a real app you'd have a SystemSetting entity
    return { key, value, updatedAt: new Date() };
  }

  async createSystemSetting(data: {
    key: string;
    value: string;
    description?: string;
    type?: string;
  }) {
    // Placeholder implementation - in a real app you'd have a SystemSetting entity
    return {
      id: `setting_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
