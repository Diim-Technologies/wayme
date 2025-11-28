"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const typeorm_config_1 = require("./config/typeorm.config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const transfers_module_1 = require("./transfers/transfers.module");
const payments_module_1 = require("./payments/payments.module");
const banks_module_1 = require("./banks/banks.module");
const notifications_module_1 = require("./notifications/notifications.module");
const admin_module_1 = require("./admin/admin.module");
const beneficiaries_module_1 = require("./beneficiaries/beneficiaries.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => (0, typeorm_config_1.getTypeOrmConfig)(configService),
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            transfers_module_1.TransfersModule,
            payments_module_1.PaymentsModule,
            banks_module_1.BanksModule,
            notifications_module_1.NotificationsModule,
            admin_module_1.AdminModule,
            beneficiaries_module_1.BeneficiariesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map