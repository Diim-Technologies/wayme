"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixTransferIdDefault1765082715234 = void 0;
class FixTransferIdDefault1765082715234 {
    constructor() {
        this.name = 'FixTransferIdDefault1765082715234';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "id" DROP DEFAULT`);
    }
}
exports.FixTransferIdDefault1765082715234 = FixTransferIdDefault1765082715234;
//# sourceMappingURL=1765082715234-FixTransferIdDefault.js.map