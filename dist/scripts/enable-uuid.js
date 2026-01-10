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
    }
    catch (error) {
        console.error('Error enabling extension:', error);
        process.exit(1);
    }
}
enableUuidExtension();
//# sourceMappingURL=enable-uuid.js.map