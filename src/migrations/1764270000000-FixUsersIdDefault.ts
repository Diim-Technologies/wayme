import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUsersIdDefault1764270000000 implements MigrationInterface {
    name = 'FixUsersIdDefault1764270000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable uuid-ossp extension if not exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Check if users table exists
        const hasTable = await queryRunner.hasTable("users");
        if (hasTable) {
            // We need to ensure the id column is of type UUID and has the correct default value.
            // Since we don't know the exact current state (could be varchar or uuid), we'll try to handle both.

            // First, drop the default if it exists (to avoid conflicts)
            await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);

            // Change type to uuid using cast (if it's not already), and set default
            // This works even if it's already uuid
            await queryRunner.query(`
                ALTER TABLE "users" 
                ALTER COLUMN "id" TYPE uuid USING "id"::uuid,
                ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()
            `);

            console.log('✅ Fixed users table id column: set type to uuid and default to uuid_generate_v4()');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We can't easily revert to "unknown previous state", but we can remove the default
        const hasTable = await queryRunner.hasTable("users");
        if (hasTable) {
            await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT`);
            // We keep it as uuid type because reverting to varchar is not necessarily what we want if we want to support uuid
        }
    }
}
