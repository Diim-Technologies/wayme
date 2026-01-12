import { MigrationInterface, QueryRunner } from "typeorm";

export class Add2FAColumnManual1768221200195 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isTwoFactorEnabled" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isTwoFactorEnabled"`);
    }

}
