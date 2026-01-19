import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsEmailVerifiedToUsers1670000000000 implements MigrationInterface {
    name = 'AddIsEmailVerifiedToUsers1670000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isEmailVerified"`);
    }
}
