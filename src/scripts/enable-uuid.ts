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

async function enableUuidExtension() {
    try {
        console.log('Connecting to database...');
        await dataSource.initialize();
        console.log('Connected!');

        console.log('Enabling "uuid-ossp" extension...');
        await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('Extension enabled successfully!');

        await dataSource.destroy();
        console.log('Connection closed.');
    } catch (error) {
        console.error('Error enabling extension:', error);
        process.exit(1);
    }
}

enableUuidExtension();
