"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixNumericFieldsOverflow1765644000000 = void 0;
class FixNumericFieldsOverflow1765644000000 {
    constructor() {
        this.name = 'FixNumericFieldsOverflow1765644000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "amount" TYPE numeric(20,2)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "fee" TYPE numeric(20,2)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "exchangeRate" TYPE numeric(20,8)`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric(20,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "percentageRate" TYPE numeric(10,4)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "fixedAmount" TYPE numeric(20,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "minimumAmount" TYPE numeric(20,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "maximumAmount" TYPE numeric(20,2)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "maximumAmount" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "minimumAmount" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "fixedAmount" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "percentageRate" TYPE numeric(5,4)`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "exchangeRate" TYPE numeric(10,4)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "fee" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "amount" TYPE numeric(10,2)`);
    }
}
exports.FixNumericFieldsOverflow1765644000000 = FixNumericFieldsOverflow1765644000000;
//# sourceMappingURL=1765644000000-FixNumericFieldsOverflow.js.map