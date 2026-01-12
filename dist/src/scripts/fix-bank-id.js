"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv = require("dotenv");
dotenv.config();
const configService = new config_1.ConfigService();
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST') || 'localhost',
    port: parseInt(configService.get('DB_PORT') || '5432'),
    username: configService.get('DB_USERNAME') || 'postgres',
    password: configService.get('DB_PASSWORD') || '',
    database: configService.get('DB_NAME') || 'wayame',
    ssl: { rejectUnauthorized: false },
});
async function fixBankIdDefault() {
    try {
        console.log('Connecting to database...');
        await dataSource.initialize();
        console.log('Connected!');
        console.log('Altering "banks" table to set default for "id"...');
        await dataSource.query(`ALTER TABLE "banks" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        console.log('Table altered successfully!');
        await dataSource.destroy();
        console.log('Connection closed.');
    }
    catch (error) {
        console.error('Error fixing bank ID default:', error);
        process.exit(1);
    }
}
fixBankIdDefault();
//# sourceMappingURL=fix-bank-id.js.map