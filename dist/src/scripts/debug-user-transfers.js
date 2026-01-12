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
    ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
});
async function debugUserTransfers() {
    try {
        console.log('Connecting to database...');
        await dataSource.initialize();
        console.log('Connected!\n');
        const userId = '0f693213-b0a0-4896-9e3b-80c4a664c62c';
        console.log(`Checking transfers for user: ${userId}\n`);
        console.log('=== Checking transfers table columns ===');
        const columns = await dataSource.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'transfers'
            ORDER BY ordinal_position
        `);
        console.log('Columns:', columns);
        console.log('\n=== Checking user ===');
        const userCheck = await dataSource.query('SELECT id, email FROM users WHERE id = $1', [userId]);
        console.log('User found:', userCheck);
        console.log('\n=== Sample transfers (first 3) ===');
        const allTransfers = await dataSource.query('SELECT * FROM transfers LIMIT 3');
        console.log('Sample transfers:', JSON.stringify(allTransfers, null, 2));
        console.log('\n=== Searching for user transfers ===');
        const userTransfers = await dataSource.query(`SELECT * FROM transfers WHERE "senderId" = $1`, [userId]);
        console.log(`Found ${userTransfers.length} transfers for user ${userId}`);
        if (userTransfers.length > 0) {
            console.log('Transfers:', JSON.stringify(userTransfers, null, 2));
        }
        await dataSource.destroy();
        console.log('\nConnection closed.');
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}
debugUserTransfers();
//# sourceMappingURL=debug-user-transfers.js.map