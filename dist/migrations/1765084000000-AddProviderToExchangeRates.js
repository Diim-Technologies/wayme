"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProviderToExchangeRates1765084000000 = void 0;
class AddProviderToExchangeRates1765084000000 {
    constructor() {
        this.name = 'AddProviderToExchangeRates1765084000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exchange_rates" ADD "provider" character varying`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exchange_rates" DROP COLUMN "provider"`);
    }
}
exports.AddProviderToExchangeRates1765084000000 = AddProviderToExchangeRates1765084000000;
//# sourceMappingURL=1765084000000-AddProviderToExchangeRates.js.map