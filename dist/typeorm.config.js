"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
dotenv_1.default.config();
const typeorm_1 = require("typeorm");
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'simeonuba',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wayame',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    migrationsTransactionMode: 'each',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
//# sourceMappingURL=typeorm.config.js.map