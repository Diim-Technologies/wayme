import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AdaptPrismaToTypeorm1732658400000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private ensureTablesExist;
}
