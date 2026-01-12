import { MigrationInterface, QueryRunner } from "typeorm";
export declare class FixAllTableIds1765084200000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
