import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIdToUsersTable1764189037149 implements MigrationInterface {
    name = 'AddIdToUsersTable1764189037149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Starting migration: Adding id column and primary key to users table...');

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
            
            // Step 1: Add the id column as nullable first
            await queryRunner.query(`
                ALTER TABLE \`users\` 
                ADD COLUMN \`id\` varchar(36) NULL FIRST
            `);

            // Step 2: Generate UUIDs for existing records
            await queryRunner.query(`
                UPDATE \`users\` 
                SET \`id\` = UUID() 
                WHERE \`id\` IS NULL
            `);

            // Step 3: Make the id column NOT NULL
            await queryRunner.query(`
                ALTER TABLE \`users\` 
                MODIFY COLUMN \`id\` varchar(36) NOT NULL
            `);

            // Step 4: Add primary key constraint
            try {
                await queryRunner.query(`
                    ALTER TABLE \`users\` 
                    ADD PRIMARY KEY (\`id\`)
                `);
                console.log('✅ Primary key added to users table');
            } catch (error) {
                console.log('⚠️ Primary key may already exist or there was an issue:', error.message);
            }

        } else {
            console.log('✅ Id column already exists in users table');
            
            // Check if it's set as primary key
            if (!idColumn.isPrimary) {
                try {
                    await queryRunner.query(`
                        ALTER TABLE \`users\` 
                        ADD PRIMARY KEY (\`id\`)
                    `);
                    console.log('✅ Primary key constraint added to existing id column');
                } catch (error) {
                    console.log('⚠️ Could not add primary key:', error.message);
                }
            } else {
                console.log('✅ Id column is already set as primary key');
            }
        }

        // Ensure other required columns exist
        await this.ensureRequiredColumnsExist(queryRunner);
        
        console.log('🎉 Migration completed successfully!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 Rolling back: Removing id column and primary key from users table...');
        
        const usersTableExists = await queryRunner.hasTable("users");
        if (usersTableExists) {
            // Remove primary key constraint
            try {
                await queryRunner.query(`ALTER TABLE \`users\` DROP PRIMARY KEY`);
            } catch (error) {
                console.log('⚠️ Could not drop primary key:', error.message);
            }

            // Remove id column
            try {
                await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`id\``);
                console.log('✅ Id column removed from users table');
            } catch (error) {
                console.log('⚠️ Could not drop id column:', error.message);
            }
        }
    }

    private async createUsersTable(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`firstName\` varchar(100) NOT NULL,
                \`lastName\` varchar(100) NOT NULL,
                \`phoneNumber\` varchar(20) NULL,
                \`password\` varchar(255) NOT NULL,
                \`role\` enum('USER','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'USER',
                \`isVerified\` tinyint NOT NULL DEFAULT 0,
                \`kycStatus\` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_users_email\` (\`email\`),
                UNIQUE INDEX \`IDX_users_phoneNumber\` (\`phoneNumber\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
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
            { name: 'role', type: "enum('USER','ADMIN','SUPER_ADMIN')", nullable: false, default: "'USER'" },
            { name: 'isVerified', type: 'tinyint', nullable: false, default: '0' },
            { name: 'kycStatus', type: "enum('PENDING','APPROVED','REJECTED')", nullable: false, default: "'PENDING'" },
            { name: 'createdAt', type: 'datetime(6)', nullable: false, default: 'CURRENT_TIMESTAMP(6)' },
            { name: 'updatedAt', type: 'datetime(6)', nullable: false, default: 'CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)' }
        ];

        for (const reqCol of requiredColumns) {
            const existingCol = columns.find(col => col.name === reqCol.name);
            if (!existingCol) {
                console.log(`📝 Adding missing column: ${reqCol.name}`);
                try {
                    const nullableStr = reqCol.nullable ? 'NULL' : 'NOT NULL';
                    const defaultStr = reqCol.default ? `DEFAULT ${reqCol.default}` : '';
                    
                    await queryRunner.query(`
                        ALTER TABLE \`users\` 
                        ADD COLUMN \`${reqCol.name}\` ${reqCol.type} ${nullableStr} ${defaultStr}
                    `);
                } catch (error) {
                    console.log(`⚠️ Could not add column ${reqCol.name}:`, error.message);
                }
            }
        }

        // Add unique constraints if they don't exist
        try {
            await queryRunner.query(`
                ALTER TABLE \`users\` 
                ADD UNIQUE INDEX \`IDX_users_email\` (\`email\`)
            `);
        } catch (error) {
            // Index may already exist
        }

        try {
            await queryRunner.query(`
                ALTER TABLE \`users\` 
                ADD UNIQUE INDEX \`IDX_users_phoneNumber\` (\`phoneNumber\`)
            `);
        } catch (error) {
            // Index may already exist
        }
    }
}
