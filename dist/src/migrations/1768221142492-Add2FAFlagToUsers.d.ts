import { MigrationInterface, QueryRunner } from "typeorm";
export declare class Add2FAFlagToUsers1768221142492 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
