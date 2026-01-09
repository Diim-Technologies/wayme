"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTransferTypeAndPaymentMethodToFees1736116000000 = void 0;
class AddTransferTypeAndPaymentMethodToFees1736116000000 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "fees" 
            ADD COLUMN "transferType" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "fees" 
            ADD COLUMN "paymentMethod" character varying
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "fees" 
            DROP COLUMN "paymentMethod"
        `);
        await queryRunner.query(`
            ALTER TABLE "fees" 
            DROP COLUMN "transferType"
        `);
    }
}
exports.AddTransferTypeAndPaymentMethodToFees1736116000000 = AddTransferTypeAndPaymentMethodToFees1736116000000;
//# sourceMappingURL=1736116000000-AddTransferTypeAndPaymentMethodToFees.js.map