import { MigrationInterface, QueryRunner } from "typeorm";

export class ForceFixExchangeRateId1765642000000 implements MigrationInterface {
    name = 'ForceFixExchangeRateId1765642000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure extension exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Force the default value on exchange_rates.id
        // We use execute arbitrary SQL to ensure it runs even if TypeORM thinks the column is okay
        await queryRunner.query(`ALTER TABLE "exchange_rates" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_rates" ALTER COLUMN "id" DROP DEFAULT`);
    }
}
