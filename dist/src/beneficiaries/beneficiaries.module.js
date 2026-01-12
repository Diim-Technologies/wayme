"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeneficiariesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const beneficiaries_service_1 = require("./beneficiaries.service");
const beneficiaries_controller_1 = require("./beneficiaries.controller");
const beneficiary_entity_1 = require("../entities/beneficiary.entity");
const user_entity_1 = require("../entities/user.entity");
let BeneficiariesModule = class BeneficiariesModule {
};
exports.BeneficiariesModule = BeneficiariesModule;
exports.BeneficiariesModule = BeneficiariesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([beneficiary_entity_1.Beneficiary, user_entity_1.User])],
        controllers: [beneficiaries_controller_1.BeneficiariesController],
        providers: [beneficiaries_service_1.BeneficiariesService],
        exports: [beneficiaries_service_1.BeneficiariesService],
    })
], BeneficiariesModule);
//# sourceMappingURL=beneficiaries.module.js.map