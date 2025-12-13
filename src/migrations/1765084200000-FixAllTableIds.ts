import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAllTableIds1765084200000 implements MigrationInterface {
    name = 'FixAllTableIds1765084200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure extension exists
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
                // Check if id column exists
                const hasId = await queryRunner.hasColumn(table, "id");
                if (hasId) {
                    // Set default uuid generation
                    await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
