import { MigrationInterface, QueryRunner } from "typeorm";
export declare class FixKycStatusDefault1768230000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
