const dotenv = require('dotenv');
dotenv.config();
const { DataSource } = require('typeorm');

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'simeonuba',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wayame',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
  migrationsTransactionMode: 'each',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
