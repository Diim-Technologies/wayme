import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePaymentMethodNullable1765083500000 implements MigrationInterface {
    name = 'MakePaymentMethodNullable1765083500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "paymentMethodId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "paymentMethodId" SET NOT NULL`);
    }
}
