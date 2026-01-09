import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransferTypeAndPaymentMethodToFees1736116000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add transferType column
        await queryRunner.query(`
            ALTER TABLE "fees" 
            ADD COLUMN "transferType" character varying
        `);

        // Add paymentMethod column
        await queryRunner.query(`
            ALTER TABLE "fees" 
            ADD COLUMN "paymentMethod" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove paymentMethod column
        await queryRunner.query(`
            ALTER TABLE "fees" 
            DROP COLUMN "paymentMethod"
        `);

        // Remove transferType column
        await queryRunner.query(`
            ALTER TABLE "fees" 
            DROP COLUMN "transferType"
        `);
    }
}
