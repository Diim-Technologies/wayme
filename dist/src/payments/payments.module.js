"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const transfer_entity_1 = require("../entities/transfer.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
const stripe_payment_method_entity_1 = require("../entities/stripe-payment-method.entity");
const user_entity_1 = require("../entities/user.entity");
const transfers_module_1 = require("../transfers/transfers.module");
const common_module_1 = require("../common/common.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                transfer_entity_1.Transfer,
                transaction_entity_1.Transaction,
                stripe_payment_method_entity_1.StripePaymentMethod,
                user_entity_1.User,
            ]),
            transfers_module_1.TransfersModule,
            common_module_1.CommonModule,
        ],
        controllers: [payments_controller_1.PaymentsController],
        providers: [payments_service_1.PaymentsService],
        exports: [payments_service_1.PaymentsService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map