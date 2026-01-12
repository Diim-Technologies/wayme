import { MigrationInterface, QueryRunner } from "typeorm";
export declare class FixGatewayResponseAndExchangeRateId1765084100000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
