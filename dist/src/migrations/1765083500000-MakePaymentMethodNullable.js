"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakePaymentMethodNullable1765083500000 = void 0;
class MakePaymentMethodNullable1765083500000 {
    constructor() {
        this.name = 'MakePaymentMethodNullable1765083500000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "paymentMethodId" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "paymentMethodId" SET NOT NULL`);
    }
}
exports.MakePaymentMethodNullable1765083500000 = MakePaymentMethodNullable1765083500000;
//# sourceMappingURL=1765083500000-MakePaymentMethodNullable.js.map