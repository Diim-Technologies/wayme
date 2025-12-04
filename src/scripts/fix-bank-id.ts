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
    } catch (error) {
        console.error('Error fixing bank ID default:', error);
        process.exit(1);
    }
}

fixBankIdDefault();
