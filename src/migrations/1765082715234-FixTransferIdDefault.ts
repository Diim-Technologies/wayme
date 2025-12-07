import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTransferIdDefault1765082715234 implements MigrationInterface {
    name = 'FixTransferIdDefault1765082715234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure extension exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        // Alter column to add default
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "id" DROP DEFAULT`);
    }
}
