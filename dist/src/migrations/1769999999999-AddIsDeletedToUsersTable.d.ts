import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddIsDeletedToUsersTable1669999999999 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
