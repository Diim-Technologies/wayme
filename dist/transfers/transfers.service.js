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
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const entities_1 = require("../entities");
const common_enum_1 = require("../enums/common.enum");
const currency_service_1 = require("../common/services/currency.service");
const fee_service_1 = require("../common/services/fee.service");
const stripe_service_1 = require("../common/services/stripe.service");
let TransfersService = class TransfersService {
    constructor(transferRepository, transactionRepository, paymentMethodRepository, userRepository, bankRepository, dataSource, currencyService, feeService, stripeService) {
        this.transferRepository = transferRepository;
        this.transactionRepository = transactionRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.userRepository = userRepository;
        this.bankRepository = bankRepository;
        this.dataSource = dataSource;
        this.currencyService = currencyService;
        this.feeService = feeService;
        this.stripeService = stripeService;
    }
    async createTransfer(userId, createTransferDto) {
        const { amount, purpose, paymentMethodId, recipientBankId, recipientAccount, recipientName, recipientPhone, receiverId, notes, targetCurrency = 'NGN', } = createTransferDto;
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: {
                id: paymentMethodId,
                userId,
                isActive: true,
            },
        });
        if (!paymentMethod) {
            throw new common_1.NotFoundException('Payment method not found or not active');
        }
        const quote = await this.calculateQuote(amount, 'NGN', targetCurrency, paymentMethod.type);
        const reference = this.generateReference();
        const transfer = await this.dataSource.transaction(async (manager) => {
            const newTransfer = manager.create(entities_1.Transfer, {
                senderId: userId,
                receiverId,
                amount: amount / 100,
                fee: parseFloat(quote.fee.toString()),
                exchangeRate: parseFloat(quote.exchangeRate.toString()),
                sourceCurrency: 'NGN',
                targetCurrency,
                purpose,
                reference,
                paymentMethodId,
                recipientBankId,
                recipientAccount,
                recipientName,
                recipientPhone,
                notes,
            });
            const savedTransfer = await manager.save(entities_1.Transfer, newTransfer);
            const transaction = manager.create(entities_1.Transaction, {
                transferId: savedTransfer.id,
                type: common_enum_1.TransactionType.DEBIT,
                amount: (amount + parseFloat(quote.fee.toString()) * 100) / 100,
                currency: 'NGN',
                reference: this.generateReference(),
            });
            await manager.save(entities_1.Transaction, transaction);
            return savedTransfer;
        });
        const transferWithRelations = await this.transferRepository.findOne({
            where: { id: transfer.id },
            relations: ['sender', 'receiver', 'paymentMethod', 'recipientBank'],
        });
        if (paymentMethod.type === common_enum_1.PaymentMethodType.CARD && paymentMethod.stripeId) {
            try {
                const user = await this.userRepository.findOne({
                    where: { id: userId },
                    select: ['email', 'firstName', 'lastName'],
                });
                const customer = await this.stripeService.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
                const totalAmount = amount + (parseFloat(quote.fee.toString()) * 100);
                const paymentIntent = await this.stripeService.createPaymentIntent(totalAmount / 100, 'ngn', customer.id, paymentMethod.stripeId, {
                    transferId: transfer.id,
                    reference: transfer.reference,
                    userId,
                    userEmail: user.email,
                });
                await this.transferRepository.update({ id: transfer.id }, { status: common_enum_1.TransferStatus.PROCESSING });
                return {
                    ...transferWithRelations,
                    paymentIntent: {
                        id: paymentIntent.id,
                        clientSecret: paymentIntent.client_secret,
                        status: paymentIntent.status,
                    },
                };
            }
            catch (error) {
                await this.transferRepository.update({ id: transfer.id }, { status: common_enum_1.TransferStatus.FAILED });
                await this.transactionRepository.update({ transferId: transfer.id }, {
                    status: common_enum_1.TransactionStatus.FAILED,
                    failureReason: 'Failed to create payment intent',
                });
                throw new common_1.BadRequestException('Failed to process payment. Please try again.');
            }
        }
        return transferWithRelations;
    }
    async createTransferWithPaymentIntent(userId, createTransferDto) {
        const transfer = await this.createTransfer(userId, createTransferDto);
        if ('paymentIntent' in transfer) {
            return transfer;
        }
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id: createTransferDto.paymentMethodId, userId },
        });
        if (paymentMethod?.type === common_enum_1.PaymentMethodType.CARD && paymentMethod.stripeId) {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: ['email', 'firstName', 'lastName'],
            });
            const customer = await this.stripeService.getOrCreateCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
            const quote = await this.calculateQuote(createTransferDto.amount, 'NGN', createTransferDto.targetCurrency || 'NGN', paymentMethod.type);
            const totalAmount = createTransferDto.amount + (parseFloat(quote.fee.toString()) * 100);
            const paymentIntent = await this.stripeService.createPaymentIntent(totalAmount / 100, 'ngn', customer.id, undefined, {
                transferId: transfer.id,
                reference: transfer.reference,
                userId,
                userEmail: user.email,
            });
            return {
                ...transfer,
                paymentIntent: {
                    id: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                    status: paymentIntent.status,
                },
            };
        }
        return transfer;
    }
    async getTransferById(id, userId) {
        const transfer = await this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.sender', 'sender')
            .leftJoinAndSelect('transfer.receiver', 'receiver')
            .leftJoinAndSelect('transfer.paymentMethod', 'paymentMethod')
            .leftJoinAndSelect('transfer.recipientBank', 'recipientBank')
            .leftJoinAndSelect('transfer.transactions', 'transactions')
            .where('transfer.id = :id', { id })
            .andWhere('(transfer.senderId = :userId OR transfer.receiverId = :userId)', { userId })
            .select([
            'transfer',
            'sender.firstName', 'sender.lastName', 'sender.email',
            'receiver.firstName', 'receiver.lastName', 'receiver.email',
            'paymentMethod',
            'recipientBank',
            'transactions'
        ])
            .getOne();
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        return transfer;
    }
    async getUserTransfers(userId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        let query = this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.sender', 'sender')
            .leftJoinAndSelect('transfer.receiver', 'receiver')
            .leftJoinAndSelect('transfer.recipientBank', 'recipientBank')
            .where('(transfer.senderId = :userId OR transfer.receiverId = :userId)', { userId })
            .select([
            'transfer',
            'sender.firstName', 'sender.lastName', 'sender.email',
            'receiver.firstName', 'receiver.lastName', 'receiver.email',
            'recipientBank'
        ])
            .orderBy('transfer.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        if (status) {
            query = query.andWhere('transfer.status = :status', { status });
        }
        const [transfers, total] = await query.getManyAndCount();
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
    async getQuote(quoteDto) {
        const { amount, sourceCurrency = 'NGN', targetCurrency = 'NGN', paymentMethodType = common_enum_1.PaymentMethodType.BANK_TRANSFER } = quoteDto;
        return this.calculateQuote(amount, sourceCurrency, targetCurrency, paymentMethodType);
    }
    async cancelTransfer(id, userId) {
        const transfer = await this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.transactions', 'transactions')
            .where('transfer.id = :id', { id })
            .andWhere('transfer.senderId = :userId', { userId })
            .andWhere('transfer.status IN (:...statuses)', {
            statuses: [common_enum_1.TransferStatus.PENDING, common_enum_1.TransferStatus.PROCESSING]
        })
            .getOne();
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found or cannot be cancelled');
        }
        const stripeTransaction = transfer.transactions?.find(t => t.gatewayRef && t.gatewayRef.startsWith('pi_'));
        if (stripeTransaction?.gatewayRef) {
            try {
                await this.stripeService.cancelPaymentIntent(stripeTransaction.gatewayRef);
            }
            catch (error) {
                console.error('Failed to cancel Stripe payment intent:', error);
            }
        }
        await this.transferRepository.update({ id }, { status: common_enum_1.TransferStatus.CANCELLED });
        return this.transferRepository.findOne({
            where: { id },
            relations: ['sender', 'recipientBank'],
            select: {
                sender: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            }
        });
    }
    async calculateQuote(amount, sourceCurrency, targetCurrency, paymentMethodType = common_enum_1.PaymentMethodType.BANK_TRANSFER) {
        const amountInNaira = new decimal_js_1.Decimal(amount / 100);
        try {
            const exchangeRate = await this.currencyService.getExchangeRate(sourceCurrency, targetCurrency, 'sell');
            const transferType = sourceCurrency === targetCurrency ? 'DOMESTIC' : 'INTERNATIONAL';
            const transferFee = await this.feeService.calculateTransferFee(amountInNaira, transferType, paymentMethodType, sourceCurrency);
            const conversionFee = await this.feeService.calculateCurrencyConversionFee(amountInNaira, sourceCurrency, targetCurrency);
            const totalFee = transferFee.add(conversionFee);
            const convertedAmount = amountInNaira.mul(exchangeRate);
            return {
                sourceAmount: amountInNaira,
                targetAmount: convertedAmount,
                fee: totalFee,
                transferFee,
                conversionFee,
                exchangeRate,
                sourceCurrency,
                targetCurrency,
                totalCost: amountInNaira.add(totalFee),
            };
        }
        catch (error) {
            return this.fallbackCalculateQuote(amount, sourceCurrency, targetCurrency);
        }
    }
    fallbackCalculateQuote(amount, sourceCurrency, targetCurrency) {
        const amountInNaira = amount / 100;
        let feeAmount = Math.max(50, Math.min(500, amountInNaira * 0.025));
        let exchangeRate = new decimal_js_1.Decimal(1);
        if (sourceCurrency !== targetCurrency) {
            const rates = {
                'NGN_USD': 0.0012,
                'NGN_GBP': 0.001,
                'NGN_EUR': 0.0011,
                'USD_NGN': 830,
                'GBP_NGN': 1000,
                'EUR_NGN': 910,
            };
            const rateKey = `${sourceCurrency}_${targetCurrency}`;
            exchangeRate = new decimal_js_1.Decimal(rates[rateKey] || 1);
        }
        const convertedAmount = new decimal_js_1.Decimal(amountInNaira).mul(exchangeRate);
        return {
            sourceAmount: new decimal_js_1.Decimal(amountInNaira),
            targetAmount: convertedAmount,
            fee: new decimal_js_1.Decimal(feeAmount),
            transferFee: new decimal_js_1.Decimal(feeAmount),
            conversionFee: new decimal_js_1.Decimal(0),
            exchangeRate,
            sourceCurrency,
            targetCurrency,
            totalCost: new decimal_js_1.Decimal(amountInNaira).add(feeAmount),
        };
    }
    generateReference() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `WAY${timestamp.slice(-6)}${random}`;
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Transfer)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.PaymentMethod)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Bank)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        currency_service_1.CurrencyService,
        fee_service_1.FeeService,
        stripe_service_1.StripeService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map