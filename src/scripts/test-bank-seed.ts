import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { Bank } from '../entities/bank.entity';
import * as fs from 'fs';

dotenv.config();

const configService = new ConfigService();

const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST') || 'localhost',
    port: parseInt(configService.get('DB_PORT') || '5432'),
    username: configService.get('DB_USERNAME') || 'postgres',
    password: configService.get('DB_PASSWORD') || '',
    database: configService.get('DB_NAME') || 'wayame',
    entities: [__dirname + '/../entities/*.entity.ts'],
    ssl: { rejectUnauthorized: false },
});

async function testBankSeed() {
    try {
        console.log('Connecting to database...');
        await dataSource.initialize();
        console.log('Connected!');

        const bankRepository = dataSource.getRepository(Bank);

        const testCode = 'TEST_999';

        // Clean up previous test if exists
        await bankRepository.delete({ code: testCode });

        console.log('Attempting to insert test bank...');
        const bank = bankRepository.create({
            name: 'Test Bank',
            code: testCode,
            country: 'NG',
        });

        const savedBank = await bankRepository.save(bank);
        console.log('Successfully saved bank with ID:', savedBank.id);

        // Clean up
        await bankRepository.delete({ code: testCode });
        console.log('Test bank cleaned up.');

        await dataSource.destroy();
        console.log('Connection closed.');
    } catch (error) {
        const errorMessage = `Error testing bank seed: ${error.message}\n${error.stack}`;
        fs.writeFileSync('error-log.txt', errorMessage);
        console.error('Error testing bank seed:', error);
        process.exit(1);
    }
}

testBankSeed();
