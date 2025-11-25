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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const currency_service_1 = require("../common/services/currency.service");
const fee_service_1 = require("../common/services/fee.service");
let AdminService = class AdminService {
    constructor(prisma, currencyService, feeService) {
        this.prisma = prisma;
        this.currencyService = currencyService;
        this.feeService = feeService;
    }
    async getDashboardStats() {
        const [totalUsers, totalTransfers, totalRevenue, pendingTransfers, completedTransfers, failedTransfers, pendingKyc,] = await Promise.all([
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
    async getAllUsers(page = 1, limit = 20, role, kycStatus) {
        const skip = (page - 1) * limit;
        const where = {};
        if (role)
            where.role = role;
        if (kycStatus)
            where.kycStatus = kycStatus;
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
    async getAllTransfers(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
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
    async updateUserRole(userId, updateUserRoleDto) {
        const { role } = updateUserRoleDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async updateKycStatus(userId, kycStatus, reason) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { kycStatus: kycStatus },
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
        if (kycStatus === 'APPROVED') {
            await this.prisma.notification.create({
                data: {
                    userId,
                    type: 'KYC_APPROVED',
                    title: 'KYC Verification Approved',
                    message: 'Your identity verification has been approved. You can now enjoy full access to all Wayame features.',
                },
            });
        }
        else if (kycStatus === 'REJECTED') {
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
    async updateTransferStatus(transferId, status, reason) {
        const transfer = await this.prisma.transfer.findUnique({
            where: { id: transferId },
            include: { sender: true },
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        const updateData = { status };
        if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
        }
        else if (status === 'PROCESSING') {
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
        const amount = transfer.amount.toNumber() * 100;
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
        }
        else if (status === 'FAILED') {
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
    async deactivateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === 'SUPER_ADMIN') {
            throw new common_1.BadRequestException('Cannot deactivate super admin user');
        }
        await this.prisma.paymentMethod.updateMany({
            where: { userId },
            data: { isActive: false },
        });
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
    async getAllExchangeRates() {
        return this.currencyService.getAllExchangeRates();
    }
    async updateExchangeRate(fromCurrency, toCurrency, data) {
        return this.currencyService.manualRateUpdate(fromCurrency, toCurrency, data.rate, data.buyRate, data.sellRate);
    }
    async deactivateExchangeRate(fromCurrency, toCurrency) {
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
    async getAllFeeConfigurations() {
        return this.feeService.getAllFeeConfigurations();
    }
    async createFeeConfiguration(data) {
        return this.feeService.createFeeConfiguration(data);
    }
    async updateFeeConfiguration(id, data) {
        return this.feeService.updateFeeConfiguration(id, data);
    }
    async deleteFeeConfiguration(id) {
        const feeConfig = await this.prisma.feeConfiguration.findUnique({
            where: { id },
        });
        if (!feeConfig) {
            throw new common_1.NotFoundException('Fee configuration not found');
        }
        return this.prisma.feeConfiguration.delete({
            where: { id },
        });
    }
    async getSystemSettings() {
        return this.prisma.systemSetting.findMany({
            where: { isActive: true },
            orderBy: { key: 'asc' },
        });
    }
    async updateSystemSetting(key, value) {
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
    async createSystemSetting(data) {
        return this.prisma.systemSetting.create({
            data,
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        currency_service_1.CurrencyService,
        fee_service_1.FeeService])
], AdminService);
//# sourceMappingURL=admin.service.js.map