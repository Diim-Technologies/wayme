import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CheckTransactionsDescription1765643000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
