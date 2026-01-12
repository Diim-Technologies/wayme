"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForceFixExchangeRateId1765642000000 = void 0;
class ForceFixExchangeRateId1765642000000 {
    constructor() {
        this.name = 'ForceFixExchangeRateId1765642000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`ALTER TABLE "exchange_rates" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exchange_rates" ALTER COLUMN "id" DROP DEFAULT`);
    }
}
exports.ForceFixExchangeRateId1765642000000 = ForceFixExchangeRateId1765642000000;
//# sourceMappingURL=1765642000000-ForceFixExchangeRateId.js.map