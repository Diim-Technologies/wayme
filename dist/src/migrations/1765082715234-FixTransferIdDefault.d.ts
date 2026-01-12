import { MigrationInterface, QueryRunner } from "typeorm";
export declare class FixTransferIdDefault1765082715234 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
