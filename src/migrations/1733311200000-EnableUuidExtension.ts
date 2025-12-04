import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableUuidExtension1733311200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable uuid-ossp extension for UUID generation
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Set default value for id column in banks table
        await queryRunner.query(`ALTER TABLE "banks" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove default value
        await queryRunner.query(`ALTER TABLE "banks" ALTER COLUMN "id" DROP DEFAULT`);

        // Drop the extension (optional - only if you want to revert)
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
