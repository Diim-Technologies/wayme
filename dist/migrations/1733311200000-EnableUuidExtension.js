"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableUuidExtension1733311200000 = void 0;
class EnableUuidExtension1733311200000 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`ALTER TABLE "banks" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "banks" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
exports.EnableUuidExtension1733311200000 = EnableUuidExtension1733311200000;
//# sourceMappingURL=1733311200000-EnableUuidExtension.js.map