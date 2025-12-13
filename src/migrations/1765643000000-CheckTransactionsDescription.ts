import { MigrationInterface, QueryRunner } from "typeorm";

export class CheckTransactionsDescription1765643000000 implements MigrationInterface {
    name = 'CheckTransactionsDescription1765643000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if description column exists in transactions table
        const hasDescription = await queryRunner.hasColumn("transactions", "description");
        if (!hasDescription) {
            console.log('Adding missing description column to transactions');
            await queryRunner.query(`ALTER TABLE "transactions" ADD "description" text`);
        } else {
            console.log('Description column already exists in transactions');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We won't remove it in down migration to be safe
    }
}
