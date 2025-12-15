import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();

const dataSource = new DataSource({
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

        // First, check the transfers table structure
        console.log('=== Checking transfers table columns ===');
        const columns = await dataSource.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'transfers'
            ORDER BY ordinal_position
        `);
        console.log('Columns:', columns);

        // Check if user exists
        console.log('\n=== Checking user ===');
        const userCheck = await dataSource.query(
            'SELECT id, email FROM users WHERE id = $1',
            [userId]
        );
        console.log('User found:', userCheck);

        // Get all transfers to see what data exists
        console.log('\n=== Sample transfers (first 3) ===');
        const allTransfers = await dataSource.query(
            'SELECT * FROM transfers LIMIT 3'
        );
        console.log('Sample transfers:', JSON.stringify(allTransfers, null, 2));

        // Try to find transfers for this user
        console.log('\n=== Searching for user transfers ===');
        const userTransfers = await dataSource.query(
            `SELECT * FROM transfers WHERE "senderId" = $1`,
            [userId]
        );
        console.log(`Found ${userTransfers.length} transfers for user ${userId}`);
        if (userTransfers.length > 0) {
            console.log('Transfers:', JSON.stringify(userTransfers, null, 2));
        }

        await dataSource.destroy();
        console.log('\nConnection closed.');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

debugUserTransfers();
