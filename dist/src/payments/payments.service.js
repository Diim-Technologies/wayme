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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transfer_entity_1 = require("../entities/transfer.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
const stripe_payment_method_entity_1 = require("../entities/stripe-payment-method.entity");
const common_enum_1 = require("../enums/common.enum");
const stripe_service_1 = require("../common/services/stripe.service");
const transfers_service_1 = require("../transfers/transfers.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(transferRepository, transactionRepository, stripePaymentMethodRepository, stripeService, transfersService) {
        this.transferRepository = transferRepository;
        this.transactionRepository = transactionRepository;
        this.stripePaymentMethodRepository = stripePaymentMethodRepository;
        this.stripeService = stripeService;
        this.transfersService = transfersService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createPaymentIntent(userId, dto) {
        const transfer = await this.transfersService.getTransferByReference(dto.transferReference, userId);
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        if (transfer.status !== common_enum_1.TransferStatus.PENDING) {
            throw new common_1.BadRequestException(`Transfer cannot be paid. Current status: ${transfer.status}`);
        }
        const totalAmount = Number(transfer.amount) + Number(transfer.fee);
        const customer = await this.stripeService.getOrCreateCustomer(userId, transfer.sender.email, `${transfer.sender.firstName} ${transfer.sender.lastName}`);
        const paymentIntent = await this.stripeService.createPaymentIntent(totalAmount, transfer.sourceCurrency, customer.id, undefined, {
            transferId: transfer.id,
            transferReference: transfer.reference,
            userId,
        });
        this.logger.log(`Payment intent created: ${paymentIntent.id} for transfer: ${transfer.reference}`);
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: totalAmount,
            currency: transfer.sourceCurrency.toLowerCase(),
            transferReference: transfer.reference,
        };
    }
    async handlePaymentSuccess(paymentIntentId) {
        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            throw new common_1.BadRequestException('Payment has not succeeded');
        }
        const transferId = paymentIntent.metadata.transferId;
        if (!transferId) {
            throw new common_1.BadRequestException('Transfer ID not found in payment metadata');
        }
        const transfer = await this.transferRepository.findOne({
            where: { id: transferId },
            relations: ['sender'],
        });
        if (!transfer) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        const transaction = this.transactionRepository.create({
            transferId: transfer.id,
            type: common_enum_1.TransactionType.DEBIT,
            amount: Number(transfer.amount) + Number(transfer.fee),
            currency: transfer.sourceCurrency,
            status: common_enum_1.TransactionStatus.SUCCESS,
            reference: paymentIntent.id,
            description: `Payment for transfer ${transfer.reference}`,
            metadata: {
                paymentIntentId: paymentIntent.id,
                stripeCustomerId: paymentIntent.customer,
                userId: transfer.senderId,
            },
        });
        await this.transactionRepository.save(transaction);
        this.logger.log(`Payment successful for transfer: ${transfer.reference}. Status set to PENDING for admin approval.`);
    }
    async getAvailablePaymentMethods() {
        return this.stripePaymentMethodRepository.find({
            where: { isActive: true },
            order: { category: 'ASC', displayName: 'ASC' },
        });
    }
    async handlePaymentFailure(paymentIntentId) {
        const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
        const transferId = paymentIntent.metadata.transferId;
        if (transferId) {
            const transfer = await this.transferRepository.findOne({
                where: { id: transferId },
            });
            if (transfer) {
                const transaction = this.transactionRepository.create({
                    transferId: transfer.id,
                    type: common_enum_1.TransactionType.DEBIT,
                    amount: Number(transfer.amount) + Number(transfer.fee),
                    currency: transfer.sourceCurrency,
                    status: common_enum_1.TransactionStatus.FAILED,
                    reference: paymentIntent.id,
                    description: `Failed payment for transfer ${transfer.reference}`,
                    failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
                    metadata: {
                        paymentIntentId: paymentIntent.id,
                        userId: transfer.senderId,
                    },
                });
                await this.transactionRepository.save(transaction);
                this.logger.warn(`Payment failed for transfer: ${transfer.reference}`);
            }
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transfer_entity_1.Transfer)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(stripe_payment_method_entity_1.StripePaymentMethod)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stripe_service_1.StripeService,
        transfers_service_1.TransfersService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map