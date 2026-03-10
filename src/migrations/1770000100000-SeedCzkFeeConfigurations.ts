import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCzkFeeConfigurations1770000100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed transfer fee for CZK
    await queryRunner.query(`
      INSERT INTO "fees" ("id", "type", "name", "fixedAmount", "percentageRate", "currency", "isActive", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'TRANSFER_FEE',
        'CZK Transfer Fee',
        10.00,
        1.5000,
        'CZK',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING
    `);

    // Seed currency conversion fee for CZK
    await queryRunner.query(`
      INSERT INTO "fees" ("id", "type", "name", "fixedAmount", "percentageRate", "currency", "isActive", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'CURRENCY_CONVERSION_FEE',
        'CZK Currency Conversion Fee',
        0.00,
        0.5000,
        'CZK',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "fees" WHERE "currency" = 'CZK'`);
  }
}
