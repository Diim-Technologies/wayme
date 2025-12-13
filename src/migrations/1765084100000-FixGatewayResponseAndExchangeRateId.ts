import { MigrationInterface, QueryRunner } from "typeorm";

export class FixGatewayResponseAndExchangeRateId1765084100000 implements MigrationInterface {
    name = 'FixGatewayResponseAndExchangeRateId1765084100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fix 1: Add gatewayResponse to transactions table if it doesn't exist
        // Note: We check specifically because previous migrations might have been inconsistent
        const hasGatewayResponse = await queryRunner.hasColumn("transactions", "gatewayResponse");
        if (!hasGatewayResponse) {
            await queryRunner.query(`ALTER TABLE "transactions" ADD "gatewayResponse" text`);
        }

        // Fix 2: Ensure default UUID generation for exchange_rates table
        // This fixes the "null value in column id" error
        await queryRunner.query(`ALTER TABLE "exchange_rates" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert default value
        await queryRunner.query(`ALTER TABLE "exchange_rates" ALTER COLUMN "id" DROP DEFAULT`);

        // Revert column addition
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "gatewayResponse"`);
    }
}
