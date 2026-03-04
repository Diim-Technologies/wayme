import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsDeletedToUsersTable1669999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "isDeleted" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isDeleted"`);
  }
}
