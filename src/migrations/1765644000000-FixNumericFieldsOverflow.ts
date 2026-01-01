import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNumericFieldsOverflow1765644000000 implements MigrationInterface {
    name = 'FixNumericFieldsOverflow1765644000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Transfers table
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "amount" TYPE numeric(20,2)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "fee" TYPE numeric(20,2)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "exchangeRate" TYPE numeric(20,8)`);

        // Transactions table
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric(20,2)`);

        // Fees table
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "percentageRate" TYPE numeric(10,4)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "fixedAmount" TYPE numeric(20,2)`);

        // Also update minimumAmount and maximumAmount if they exist (based on previous investigation migration 1732658400000 created them)
        // Checking if columns exist first is safer but for this task we know they were created in the initial migration
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "minimumAmount" TYPE numeric(20,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "maximumAmount" TYPE numeric(20,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert Fees table
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "maximumAmount" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "minimumAmount" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "fixedAmount" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "fees" ALTER COLUMN "percentageRate" TYPE numeric(5,4)`);

        // Revert Transactions table
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE numeric(10,2)`);

        // Revert Transfers table
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "exchangeRate" TYPE numeric(10,4)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "fee" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "amount" TYPE numeric(10,2)`);
    }
}
