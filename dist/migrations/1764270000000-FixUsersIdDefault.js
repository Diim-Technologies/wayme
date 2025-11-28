"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixUsersIdDefault1764270000000 = void 0;
class FixUsersIdDefault1764270000000 {
    constructor() {
        this.name = 'FixUsersIdDefault1764270000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        const hasTable = await queryRunner.hasTable("users");
        if (hasTable) {
            await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
            await queryRunner.query(`
                ALTER TABLE "users" 
                ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
                ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()
            `);
            console.log('✅ Fixed users table id column: set type to uuid and default to uuid_generate_v4()');
        }
    }
    async down(queryRunner) {
        const hasTable = await queryRunner.hasTable("users");
        if (hasTable) {
            await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
        }
    }
}
exports.FixUsersIdDefault1764270000000 = FixUsersIdDefault1764270000000;
//# sourceMappingURL=1764270000000-FixUsersIdDefault.js.map