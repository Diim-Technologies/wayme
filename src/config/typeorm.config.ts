import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST') || 'localhost',
  port: parseInt(configService.get('DB_PORT') || '3306'),
  username: configService.get('DB_USERNAME') || 'root',
  password: configService.get('DB_PASSWORD') || '',
  database: configService.get('DB_NAME') || 'wayame',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // Disabled to prevent conflicts with existing schema
  logging: configService.get('NODE_ENV') === 'development',
  migrationsRun: false,
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
});

// DataSource for migrations
export default new DataSource({
  type: 'mysql',
  host: configService.get('DB_HOST') || 'localhost',
  port: parseInt(configService.get('DB_PORT') || '3306'),
  username: configService.get('DB_USERNAME') || 'root',
  password: configService.get('DB_PASSWORD') || '',
  database: configService.get('DB_NAME') || 'wayame',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});