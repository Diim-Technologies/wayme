"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptPrismaToTypeorm1732658400000 = void 0;
class AdaptPrismaToTypeorm1732658400000 {
    constructor() {
        this.name = 'AdaptPrismaToTypeorm1732658400000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`typeorm_metadata\` (
                \`type\` varchar(255) NOT NULL,
                \`database\` varchar(255) DEFAULT NULL,
                \`schema\` varchar(255) DEFAULT NULL,
                \`table\` varchar(255) DEFAULT NULL,
                \`name\` varchar(255) DEFAULT NULL,
                \`value\` text
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await this.ensureTablesExist(queryRunner);
        console.log('✅ Migration completed: Database adapted for TypeORM');
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS \`typeorm_metadata\``);
    }
    async ensureTablesExist(queryRunner) {
        const banksExists = await queryRunner.hasTable("banks");
        if (!banksExists) {
            await queryRunner.query(`
                CREATE TABLE \`banks\` (
                    \`id\` varchar(36) NOT NULL,
                    \`name\` varchar(255) NOT NULL,
                    \`code\` varchar(10) NOT NULL,
                    \`country\` varchar(3) NOT NULL DEFAULT 'NG',
                    \`isActive\` tinyint NOT NULL DEFAULT 1,
                    \`logoUrl\` varchar(255) NULL,
                    \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    UNIQUE INDEX \`IDX_banks_code\` (\`code\`),
                    PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB
            `);
        }
        const currenciesExists = await queryRunner.hasTable("currencies");
        if (!currenciesExists) {
            await queryRunner.query(`
                CREATE TABLE \`currencies\` (
                    \`id\` varchar(36) NOT NULL,
                    \`code\` varchar(3) NOT NULL,
                    \`name\` varchar(100) NOT NULL,
                    \`symbol\` varchar(10) NOT NULL,
                    \`isActive\` tinyint NOT NULL DEFAULT 1,
                    \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    UNIQUE INDEX \`IDX_currencies_code\` (\`code\`),
                    PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB
            `);
        }
        const exchangeRatesExists = await queryRunner.hasTable("exchange_rates");
        if (!exchangeRatesExists) {
            await queryRunner.query(`
                CREATE TABLE \`exchange_rates\` (
                    \`id\` varchar(36) NOT NULL,
                    \`fromCurrency\` varchar(3) NOT NULL,
                    \`toCurrency\` varchar(3) NOT NULL,
                    \`rate\` decimal(20,8) NOT NULL,
                    \`provider\` enum('MANUAL','EXTERNAL_API') NOT NULL DEFAULT 'EXTERNAL_API',
                    \`isActive\` tinyint NOT NULL DEFAULT 1,
                    \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    INDEX \`IDX_exchange_rates_pair\` (\`fromCurrency\`, \`toCurrency\`),
                    PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB
            `);
        }
        const feesExists = await queryRunner.hasTable("fees");
        if (!feesExists) {
            await queryRunner.query(`
                CREATE TABLE \`fees\` (
                    \`id\` varchar(36) NOT NULL,
                    \`name\` varchar(255) NOT NULL,
                    \`type\` enum('TRANSFER_FEE','CURRENCY_CONVERSION_FEE','WITHDRAWAL_FEE','CARD_PROCESSING_FEE') NOT NULL,
                    \`currency\` varchar(3) NOT NULL DEFAULT 'NGN',
                    \`percentageRate\` decimal(5,4) NULL,
                    \`fixedAmount\` decimal(10,2) NULL,
                    \`minimumAmount\` decimal(10,2) NULL,
                    \`maximumAmount\` decimal(10,2) NULL,
                    \`isActive\` tinyint NOT NULL DEFAULT 1,
                    \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    PRIMARY KEY (\`id\`)
                ) ENGINE=InnoDB
            `);
        }
    }
}
exports.AdaptPrismaToTypeorm1732658400000 = AdaptPrismaToTypeorm1732658400000;
//# sourceMappingURL=1732658400000-AdaptPrismaToTypeorm.js.map