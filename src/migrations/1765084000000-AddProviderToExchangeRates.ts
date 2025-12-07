import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderToExchangeRates1765084000000 implements MigrationInterface {
    name = 'AddProviderToExchangeRates1765084000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_rates" ADD "provider" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_rates" DROP COLUMN "provider"`);
    }
}
