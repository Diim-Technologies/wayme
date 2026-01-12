"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const entities_1 = require("../entities");
const email_service_1 = require("./services/email.service");
const paystack_service_1 = require("./services/paystack.service");
const stripe_service_1 = require("./services/stripe.service");
const currency_service_1 = require("./services/currency.service");
const fee_service_1 = require("./services/fee.service");
const stripe_webhook_service_1 = require("./services/stripe-webhook.service");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([entities_1.ExchangeRate, entities_1.Fee, entities_1.User, entities_1.Transfer, entities_1.Transaction, entities_1.PaymentMethod, entities_1.Notification]),
        ],
        providers: [
            currency_service_1.CurrencyService,
            email_service_1.EmailService,
            paystack_service_1.PaystackService,
            fee_service_1.FeeService,
            stripe_service_1.StripeService,
            stripe_webhook_service_1.StripeWebhookService,
        ],
        exports: [
            currency_service_1.CurrencyService,
            email_service_1.EmailService,
            paystack_service_1.PaystackService,
            fee_service_1.FeeService,
            stripe_service_1.StripeService,
            stripe_webhook_service_1.StripeWebhookService,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map