import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddIdToUsersTable1764189037149 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private createUsersTable;
    private ensureRequiredColumnsExist;
}
