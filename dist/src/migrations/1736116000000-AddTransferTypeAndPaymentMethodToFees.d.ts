import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddTransferTypeAndPaymentMethodToFees1736116000000 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
