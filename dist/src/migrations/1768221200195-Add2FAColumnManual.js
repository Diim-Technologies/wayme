"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Add2FAColumnManual1768221200195 = void 0;
class Add2FAColumnManual1768221200195 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "isTwoFactorEnabled" boolean NOT NULL DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isTwoFactorEnabled"`);
    }
}
exports.Add2FAColumnManual1768221200195 = Add2FAColumnManual1768221200195;
//# sourceMappingURL=1768221200195-Add2FAColumnManual.js.map