"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixAllTableIds1765084200000 = void 0;
class FixAllTableIds1765084200000 {
    constructor() {
        this.name = 'FixAllTableIds1765084200000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        const tables = [
            'transactions',
            'notifications',
            'payment_methods',
            'user_profiles',
            'beneficiaries',
            'otps',
            'stripe_payment_methods'
        ];
        for (const table of tables) {
            const hasTable = await queryRunner.hasTable(table);
            if (hasTable) {
                const hasId = await queryRunner.hasColumn(table, "id");
                if (hasId) {
                    await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
                }
            }
        }
    }
    async down(queryRunner) {
        const tables = [
            'transactions',
            'notifications',
            'payment_methods',
            'user_profiles',
            'beneficiaries',
            'otps',
            'stripe_payment_methods'
        ];
        for (const table of tables) {
            const hasTable = await queryRunner.hasTable(table);
            if (hasTable) {
                const hasId = await queryRunner.hasColumn(table, "id");
                if (hasId) {
                    await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "id" DROP DEFAULT`);
                }
            }
        }
    }
}
exports.FixAllTableIds1765084200000 = FixAllTableIds1765084200000;
//# sourceMappingURL=1765084200000-FixAllTableIds.js.map