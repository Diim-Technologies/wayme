"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv = require("dotenv");
const bank_entity_1 = require("../entities/bank.entity");
const fs = require("fs");
dotenv.config();
const configService = new config_1.ConfigService();
const dataSource = new typeorm_1.DataSource({
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
        const bankRepository = dataSource.getRepository(bank_entity_1.Bank);
        const testCode = 'TEST_999';
        await bankRepository.delete({ code: testCode });
        console.log('Attempting to insert test bank...');
        const bank = bankRepository.create({
            name: 'Test Bank',
            code: testCode,
            country: 'NG',
        });
        const savedBank = await bankRepository.save(bank);
        console.log('Successfully saved bank with ID:', savedBank.id);
        await bankRepository.delete({ code: testCode });
        console.log('Test bank cleaned up.');
        await dataSource.destroy();
        console.log('Connection closed.');
    }
    catch (error) {
        const errorMessage = `Error testing bank seed: ${error.message}\n${error.stack}`;
        fs.writeFileSync('error-log.txt', errorMessage);
        console.error('Error testing bank seed:', error);
        process.exit(1);
    }
}
testBankSeed();
//# sourceMappingURL=test-bank-seed.js.map