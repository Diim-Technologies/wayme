import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUniqueConstraintsPartialForSoftDelete1770000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing unique constraints on email and phoneNumber
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_1e3d0240b49c40521aaeb953293"`);

    // Drop any existing unique indexes on these columns
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_1e3d0240b49c40521aaeb95329"`);

    // Create partial unique indexes that only enforce uniqueness for non-deleted users
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email_active" ON "users" ("email") WHERE "isDeleted" = false`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_phoneNumber_active" ON "users" ("phoneNumber") WHERE "isDeleted" = false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop partial unique indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_phoneNumber_active"`);

    // Re-create the original unique constraints
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber")`,
    );
  }
}
