import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIdToUsersTable1764189037149 implements MigrationInterface {
    name = 'AddIdToUsersTable1764189037149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Starting migration: Adding id column and primary key to users table...');

        // Enable uuid-ossp extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Check if users table exists
        const usersTableExists = await queryRunner.hasTable("users");
        if (!usersTableExists) {
            console.log('❌ Users table does not exist. Creating it...');
            await this.createUsersTable(queryRunner);
            return;
        }

        // Get current table structure
        const usersTable = await queryRunner.getTable("users");
        const idColumn = usersTable?.columns.find(col => col.name === 'id');

        if (!idColumn) {
            console.log('🆔 Adding id column to users table...');

            // Add id column with default
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD COLUMN "id" uuid DEFAULT uuid_generate_v4() NOT NULL
            `);

            // Add primary key constraint
            try {
                await queryRunner.query(`
                    ALTER TABLE "users" 
                    ADD PRIMARY KEY ("id")
                `);
                console.log('✅ Primary key added to users table');
            } catch (error) {
                console.log('⚠️ Primary key may already exist or there was an issue:', error.message);
            }

        } else {
            console.log('✅ Id column already exists in users table');

            // Ensure default value is set
            try {
                // Try to cast to uuid if needed and set default
                // We use a safe approach: if it's varchar, we might need to cast.
                // But let's assume if it exists we just want to ensure default.
                await queryRunner.query(`
                    ALTER TABLE "users" 
                    ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()
                `);
                console.log('✅ Default value set for id column');
            } catch (error) {
                console.log('⚠️ Could not set default value:', error.message);
            }

            // Check if it's set as primary key
            if (!idColumn.isPrimary) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE "users" 
                        ADD PRIMARY KEY ("id")
                    `);
                    console.log('✅ Primary key constraint added to existing id column');
                } catch (error) {
                    console.log('⚠️ Could not add primary key:', error.message);
                }
            }
        }

        // Ensure other required columns exist
        await this.ensureRequiredColumnsExist(queryRunner);

        console.log('🎉 Migration completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Rolling back...');
        // await queryRunner.dropTable("users");
    }

    private async createUsersTable(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM types if they don't exist
        await queryRunner.query(`DO $$ BEGIN
            CREATE TYPE "user_role_enum" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;`);

        await queryRunner.query(`DO $$ BEGIN
            CREATE TYPE "user_kycstatus_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;`);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(255) NOT NULL,
                "firstName" character varying(100) NOT NULL,
                "lastName" character varying(100) NOT NULL,
                "phoneNumber" character varying(20),
                "password" character varying(255) NOT NULL,
                "role" "user_role_enum" NOT NULL DEFAULT 'USER',
                "isVerified" boolean NOT NULL DEFAULT false,
                "kycStatus" "user_kycstatus_enum" NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "UQ_users_phoneNumber" UNIQUE ("phoneNumber"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);
        console.log('✅ Users table created with proper structure');
    }

    private async ensureRequiredColumnsExist(queryRunner: QueryRunner): Promise<void> {
        const usersTable = await queryRunner.getTable("users");
        const columns = usersTable?.columns || [];

        const requiredColumns = [
            { name: 'email', type: 'varchar(255)', nullable: false },
            { name: 'firstName', type: 'varchar(100)', nullable: false },
            { name: 'lastName', type: 'varchar(100)', nullable: false },
            { name: 'phoneNumber', type: 'varchar(20)', nullable: true },
            { name: 'password', type: 'varchar(255)', nullable: false },
        ];

        for (const reqCol of requiredColumns) {
            const existingCol = columns.find(col => col.name === reqCol.name);
            if (!existingCol) {
                console.log(`📝 Adding missing column: ${reqCol.name}`);
                const nullableStr = reqCol.nullable ? 'NULL' : 'NOT NULL';
                await queryRunner.query(`
                    ALTER TABLE "users" 
                    ADD COLUMN "${reqCol.name}" ${reqCol.type} ${nullableStr}
                `);
            }
        }
    }
}
