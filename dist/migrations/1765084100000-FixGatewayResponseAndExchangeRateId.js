"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixGatewayResponseAndExchangeRateId1765084100000 = void 0;
class FixGatewayResponseAndExchangeRateId1765084100000 {
    constructor() {
        this.name = 'FixGatewayResponseAndExchangeRateId1765084100000';
    }
    async up(queryRunner) {
        const hasGatewayResponse = await queryRunner.hasColumn("transactions", "gatewayResponse");
        if (!hasGatewayResponse) {
            await queryRunner.query(`ALTER TABLE "transactions" ADD "gatewayResponse" text`);
        }
        await queryRunner.query(`ALTER TABLE "exchange_rates" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exchange_rates" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "gatewayResponse"`);
    }
}
exports.FixGatewayResponseAndExchangeRateId1765084100000 = FixGatewayResponseAndExchangeRateId1765084100000;
//# sourceMappingURL=1765084100000-FixGatewayResponseAndExchangeRateId.js.map