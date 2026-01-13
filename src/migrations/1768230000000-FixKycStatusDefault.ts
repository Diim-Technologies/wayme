import { MigrationInterface, QueryRunner } from "typeorm";

export class FixKycStatusDefault1768230000000 implements MigrationInterface {
    name = 'FixKycStatusDefault1768230000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Fixing KYC status default (VARCHAR)...');

        // 1. Change the default value of the column (it's a varchar, so we just set it)
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "kycStatus" SET DEFAULT 'NOT_SUBMITTED'`);

        // 2. Update existing users: if they are 'PENDING' but have no KYC documents, move them to 'NOT_SUBMITTED'
        await queryRunner.query(`
            UPDATE "users"
            SET "kycStatus" = 'NOT_SUBMITTED'
            WHERE "kycStatus" = 'PENDING'
            AND "id"::text NOT IN (
                SELECT DISTINCT "userId"::text 
                FROM "kyc_documents"
                WHERE "userId" IS NOT NULL
            )
        `);

        console.log('✅ KYC status fix completed');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse changes
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "kycStatus" SET DEFAULT 'PENDING'`);

        // Note: You cannot easily remove values from an ENUM in PostgreSQL
        // So we leave the enum as is, which is harmless.
    }
}
