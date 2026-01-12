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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const user_enum_1 = require("../enums/user.enum");
const common_enum_1 = require("../enums/common.enum");
const currency_service_1 = require("../common/services/currency.service");
const fee_service_1 = require("../common/services/fee.service");
const email_service_1 = require("../common/services/email.service");
const decimal_js_1 = require("decimal.js");
const bcrypt = require("bcrypt");
let AdminService = class AdminService {
    constructor(userRepository, transferRepository, transactionRepository, paymentMethodRepository, bankRepository, feeRepository, currencyRepository, notificationRepository, otpRepository, dataSource, currencyService, feeService, emailService) {
        this.userRepository = userRepository;
        this.transferRepository = transferRepository;
        this.transactionRepository = transactionRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.bankRepository = bankRepository;
        this.feeRepository = feeRepository;
        this.currencyRepository = currencyRepository;
        this.notificationRepository = notificationRepository;
        this.otpRepository = otpRepository;
        this.dataSource = dataSource;
        this.currencyService = currencyService;
        this.feeService = feeService;
        this.emailService = emailService;
    }
    async getDashboardStats() {
        const [totalUsers, totalTransfers, revenueResult, pendingTransfers, completedTransfers, failedTransfers, pendingKyc,] = await Promise.all([
            this.userRepository.count(),
            this.transferRepository.count(),
            this.transferRepository
                .createQueryBuilder('transfer')
                .select('SUM(transfer.fee)', 'totalRevenue')
                .where('transfer.status = :status', { status: common_enum_1.TransferStatus.COMPLETED })
                .getRawOne(),
            this.transferRepository.count({ where: { status: common_enum_1.TransferStatus.PENDING } }),
            this.transferRepository.count({ where: { status: common_enum_1.TransferStatus.COMPLETED } }),
            this.transferRepository.count({ where: { status: common_enum_1.TransferStatus.FAILED } }),
            this.userRepository.count({ where: { kycStatus: user_enum_1.KycStatus.PENDING } }),
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
    async getAllUsers(page = 1, limit = 20, role, kycStatus) {
        const skip = (page - 1) * limit;
        const where = {};
        if (role)
            where.role = role;
        if (kycStatus)
            where.kycStatus = kycStatus;
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
    async getAllTransfers(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [transfers, total] = await Promise.all([
            this.transferRepository.find({
                where,
                relations: ['sender', 'receiver', 'recipientBank', 'transactions'],
                select: {
                    sender: { id: true, firstName: true, lastName: true, email: true },
                    receiver: { id: true, firstName: true, lastName: true, email: true },
                },
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            }),
            this.transferRepository.count({ where }),
        ]);
        const sanitizedTransfers = transfers.map(transfer => {
            if (transfer.transactions) {
                transfer.transactions.forEach(transaction => {
                    delete transaction.transfer;
                });
            }
            return transfer;
        });
        return {
            transfers: sanitizedTransfers.map(t => ({
                ...t,
                convertedAmount: new decimal_js_1.Decimal(t.amount).mul(t.exchangeRate || 0).toNumber(),
            })),
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
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.userRepository.update({ id: userId }, { role: role });
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
    async createAdminUser(createAdminUserDto) {
        const { email, firstName, lastName, phoneNumber, password, role } = createAdminUserDto;
        const existingUserByEmail = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUserByEmail) {
            throw new common_1.ConflictException('Email address is already registered');
        }
        const existingUserByPhone = await this.userRepository.findOne({
            where: { phoneNumber },
        });
        if (existingUserByPhone) {
            throw new common_1.ConflictException('Phone number is already registered');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const adminUser = this.userRepository.create({
            email,
            firstName,
            lastName,
            phoneNumber,
            password: hashedPassword,
            role: role,
            isVerified: true,
            kycStatus: user_enum_1.KycStatus.APPROVED,
        });
        const savedUser = await this.userRepository.save(adminUser);
        const { password: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }
    async updateKycStatus(userId, kycStatus, reason) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.User, { id: userId }, { kycStatus: kycStatus });
            if (kycStatus === user_enum_1.KycStatus.APPROVED) {
                const notification = manager.create(entities_1.Notification, {
                    userId,
                    type: common_enum_1.NotificationType.KYC_APPROVED,
                    title: 'KYC Verification Approved',
                    message: 'Your identity verification has been approved. You can now enjoy full access to all Wayame features.',
                });
                await manager.save(entities_1.Notification, notification);
            }
            else if (kycStatus === user_enum_1.KycStatus.REJECTED) {
                const notification = manager.create(entities_1.Notification, {
                    userId,
                    type: common_enum_1.NotificationType.KYC_REJECTED,
                    title: 'KYC Verification Rejected',
                    message: `Your identity verification was rejected. ${reason ? `Reason: ${reason}` : ''} Please update your documents and try again.`,
                    data: { reason },
                });
                await manager.save(entities_1.Notification, notification);
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
    async updateTransferStatus(transferId, status, reason) {
        const transfer = await this.transferRepository.findOne({
            where: { id: transferId },
            relations: ['sender'],
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        const updateData = { status };
        if (status === common_enum_1.TransferStatus.COMPLETED) {
            updateData.completedAt = new Date();
        }
        else if (status === common_enum_1.TransferStatus.PROCESSING) {
            updateData.processedAt = new Date();
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.Transfer, { id: transferId }, updateData);
            const amount = transfer.amount * 100;
            if (status === common_enum_1.TransferStatus.COMPLETED) {
                const notification = manager.create(entities_1.Notification, {
                    userId: transfer.senderId,
                    type: common_enum_1.NotificationType.TRANSFER_COMPLETED,
                    title: 'Transfer Completed',
                    message: `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transfer.reference} has been completed successfully.`,
                    data: { transferId, reference: transfer.reference, amount },
                });
                await manager.save(entities_1.Notification, notification);
            }
            else if (status === common_enum_1.TransferStatus.FAILED) {
                const notification = manager.create(entities_1.Notification, {
                    userId: transfer.senderId,
                    type: common_enum_1.NotificationType.TRANSFER_FAILED,
                    title: 'Transfer Failed',
                    message: `Your transfer of ₦${(amount / 100).toLocaleString()} with reference ${transfer.reference} has failed. ${reason ? `Reason: ${reason}` : ''}`,
                    data: { transferId, reference: transfer.reference, amount, reason },
                });
                await manager.save(entities_1.Notification, notification);
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
    async approveTransfer(transferId) {
        const transfer = await this.transferRepository.findOne({
            where: { id: transferId },
            relations: ['sender', 'transactions'],
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        if (transfer.status !== common_enum_1.TransferStatus.PENDING) {
            throw new common_1.BadRequestException(`Transfer is not pending approval. Current status: `);
        }
        const hasSuccessfulPayment = transfer.transactions?.some(t => t.status === common_enum_1.TransactionStatus.SUCCESS && t.gatewayRef);
        if (!hasSuccessfulPayment) {
            throw new common_1.BadRequestException('Transfer payment has not been completed successfully');
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.Transfer, { id: transferId }, {
                status: common_enum_1.TransferStatus.COMPLETED,
                completedAt: new Date(),
            });
            const amount = transfer.amount * 100;
            const notification = manager.create(entities_1.Notification, {
                userId: transfer.senderId,
                type: common_enum_1.NotificationType.TRANSFER_COMPLETED,
                title: 'Transfer Approved',
                message: `Your transfer of  with reference  has been approved and completed.`,
                data: { transferId, reference: transfer.reference, amount },
            });
            await manager.save(entities_1.Notification, notification);
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
    async deactivateUser(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === user_enum_1.UserRole.SUPER_ADMIN) {
            throw new common_1.BadRequestException('Cannot deactivate super admin user');
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(entities_1.PaymentMethod, { userId }, { isActive: false });
            await manager.update(entities_1.Transfer, { senderId: userId, status: common_enum_1.TransferStatus.PENDING }, { status: common_enum_1.TransferStatus.CANCELLED });
        });
        return { message: 'User deactivated successfully', userId };
    }
    async getSystemLogs(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
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
    async getAllExchangeRates() {
        return this.currencyService.getAllExchangeRates();
    }
    async updateExchangeRate(fromCurrency, toCurrency, data) {
        return this.currencyService.manualRateUpdate(fromCurrency, toCurrency, data.rate, data.buyRate, data.sellRate);
    }
    async refreshExchangeRates() {
        await this.currencyService.fetchAndUpdateRates();
        return { message: 'Exchange rates updated successfully' };
    }
    async deactivateExchangeRate(fromCurrency, toCurrency) {
        const exchangeRate = await this.currencyService.getAllExchangeRates();
        const targetRate = exchangeRate.find(rate => rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency);
        if (!targetRate) {
            throw new common_1.NotFoundException('Exchange rate not found');
        }
        return { message: 'Exchange rate deactivated successfully', fromCurrency, toCurrency };
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
        const feeConfig = await this.feeRepository.findOne({
            where: { id },
        });
        if (!feeConfig) {
            throw new common_1.NotFoundException('Fee configuration not found');
        }
        return this.feeRepository.remove(feeConfig);
    }
    async getSystemSettings() {
        return [
            { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode' },
            { key: 'max_daily_transfer', value: '1000000', description: 'Maximum daily transfer amount in kobo' },
            { key: 'min_transfer_amount', value: '10000', description: 'Minimum transfer amount in kobo' },
        ];
    }
    async updateSystemSetting(key, value) {
        return { key, value, updatedAt: new Date() };
    }
    async createSystemSetting(data) {
        return {
            id: `setting_${Date.now()}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    async requestAdminVerificationOTP(requestDto) {
        const { email } = requestDto;
        const admin = await this.userRepository.findOne({
            where: { email },
        });
        if (!admin) {
            throw new common_1.NotFoundException('Admin user not found');
        }
        if (admin.role !== user_enum_1.UserRole.ADMIN && admin.role !== user_enum_1.UserRole.SUPER_ADMIN) {
            throw new common_1.BadRequestException('User is not an admin');
        }
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpEntity = this.otpRepository.create({
            userId: admin.id,
            code: otp,
            type: common_enum_1.OTPType.TWO_FACTOR_AUTH,
            expiresAt,
        });
        await this.otpRepository.save(otpEntity);
        try {
            await this.emailService.sendAdminVerificationOTP(email, otp, admin.firstName);
        }
        catch (error) {
            console.log('Failed to send admin verification OTP:', error);
            throw new common_1.BadRequestException('Failed to send verification email. Please try again.');
        }
        return {
            message: 'Verification code sent to your email address.',
            otpSent: true,
        };
    }
    async verifyAdminOTP(verifyAdminOtpDto) {
        const { email, code } = verifyAdminOtpDto;
        const admin = await this.userRepository.findOne({
            where: { email },
        });
        if (!admin) {
            throw new common_1.NotFoundException('Admin user not found');
        }
        if (admin.role !== user_enum_1.UserRole.ADMIN && admin.role !== user_enum_1.UserRole.SUPER_ADMIN) {
            throw new common_1.BadRequestException('User is not an admin');
        }
        const otp = await this.otpRepository.findOne({
            where: {
                userId: admin.id,
                code,
                type: common_enum_1.OTPType.TWO_FACTOR_AUTH,
                isUsed: false,
            },
        });
        if (!otp || otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired verification code');
        }
        await this.otpRepository.update({ id: otp.id }, { isUsed: true });
        return {
            message: 'Admin verification successful.',
            verified: true,
        };
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Transfer)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Transaction)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.PaymentMethod)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Bank)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Fee)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.Currency)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.Notification)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.OTP)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        currency_service_1.CurrencyService,
        fee_service_1.FeeService,
        email_service_1.EmailService])
], AdminService);
//# sourceMappingURL=admin.service.js.map