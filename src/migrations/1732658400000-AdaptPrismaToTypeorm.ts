import { MigrationInterface, QueryRunner } from "typeorm";

export class AdaptPrismaToTypeorm1732658400000 implements MigrationInterface {
    name = 'AdaptPrismaToTypeorm1732658400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable uuid-ossp extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create TypeORM metadata table if it doesn't exist
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "typeorm_metadata" (
                "type" varchar(255) NOT NULL,
                "database" varchar(255) DEFAULT NULL,
                "schema" varchar(255) DEFAULT NULL,
                "table" varchar(255) DEFAULT NULL,
                "name" varchar(255) DEFAULT NULL,
                "value" text
            )
        `);

        // Ensure all required tables exist with proper structure
        await this.ensureTablesExist(queryRunner);

        console.log('✅ Migration completed: Database adapted for TypeORM');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Down migration - remove TypeORM metadata table
        await queryRunner.query(`DROP TABLE IF EXISTS "typeorm_metadata"`);
    }

    private async ensureTablesExist(queryRunner: QueryRunner): Promise<void> {
        // Create banks table if it doesn't exist
        const banksExists = await queryRunner.hasTable("banks");
        if (!banksExists) {
            await queryRunner.query(`
                CREATE TABLE "banks" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" varchar(255) NOT NULL,
                    "code" varchar(10) NOT NULL,
                    "country" varchar(3) NOT NULL DEFAULT 'NG',
                    "isActive" boolean NOT NULL DEFAULT true,
                    "logoUrl" varchar(255) NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_banks_code" UNIQUE ("code"),
                    CONSTRAINT "PK_banks" PRIMARY KEY ("id")
                )
            `);
        }

        // Create currencies table if it doesn't exist
        const currenciesExists = await queryRunner.hasTable("currencies");
        if (!currenciesExists) {
            await queryRunner.query(`
                CREATE TABLE "currencies" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "code" varchar(3) NOT NULL,
                    "name" varchar(100) NOT NULL,
                    "symbol" varchar(10) NOT NULL,
                    "isActive" boolean NOT NULL DEFAULT true,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_currencies_code" UNIQUE ("code"),
                    CONSTRAINT "PK_currencies" PRIMARY KEY ("id")
                )
            `);
        }

        // Create exchange_rates table if it doesn't exist
        const exchangeRatesExists = await queryRunner.hasTable("exchange_rates");
        if (!exchangeRatesExists) {
            // Create ENUM type
            await queryRunner.query(`DO $$ BEGIN
                CREATE TYPE "exchange_rates_provider_enum" AS ENUM ('MANUAL', 'EXTERNAL_API');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;`);

            await queryRunner.query(`
                CREATE TABLE "exchange_rates" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "fromCurrency" varchar(3) NOT NULL,
                    "toCurrency" varchar(3) NOT NULL,
                    "rate" decimal(20,8) NOT NULL,
                    "provider" "exchange_rates_provider_enum" NOT NULL DEFAULT 'EXTERNAL_API',
                    "isActive" boolean NOT NULL DEFAULT true,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_exchange_rates" PRIMARY KEY ("id")
                )
            `);
            // Index
            await queryRunner.query(`CREATE INDEX "IDX_exchange_rates_pair" ON "exchange_rates" ("fromCurrency", "toCurrency")`);
        }

        // Create fees table if it doesn't exist
        const feesExists = await queryRunner.hasTable("fees");
        if (!feesExists) {
            // Create ENUM type
            await queryRunner.query(`DO $$ BEGIN
                CREATE TYPE "fees_type_enum" AS ENUM ('TRANSFER_FEE', 'CURRENCY_CONVERSION_FEE', 'WITHDRAWAL_FEE', 'CARD_PROCESSING_FEE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;`);

            await queryRunner.query(`
                CREATE TABLE "fees" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" varchar(255) NOT NULL,
                    "type" "fees_type_enum" NOT NULL,
                    "currency" varchar(3) NOT NULL DEFAULT 'NGN',
                    "percentageRate" decimal(5,4) NULL,
                    "fixedAmount" decimal(10,2) NULL,
                    "minimumAmount" decimal(10,2) NULL,
                    "maximumAmount" decimal(10,2) NULL,
                    "isActive" boolean NOT NULL DEFAULT true,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_fees" PRIMARY KEY ("id")
                )
            `);
        }
    }
}