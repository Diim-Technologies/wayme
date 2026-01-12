import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export declare const getTypeOrmConfig: (configService: ConfigService) => TypeOrmModuleOptions;
declare const _default: DataSource;
export default _default;
