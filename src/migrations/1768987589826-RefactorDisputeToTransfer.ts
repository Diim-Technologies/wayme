import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class RefactorDisputeToTransfer1768987589826 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop the existing foreign key for transactionId
        const table = await queryRunner.getTable("disputes");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("transactionId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("disputes", foreignKey);
        }

        // 2. Rename column transactionId to transferId
        await queryRunner.renameColumn("disputes", "transactionId", "transferId");

        // 3. Create new foreign key to transfers table
        await queryRunner.createForeignKey("disputes", new TableForeignKey({
            columnNames: ["transferId"],
            referencedColumnNames: ["id"],
            referencedTableName: "transfers",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Drop the foreign key for transferId
        const table = await queryRunner.getTable("disputes");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("transferId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("disputes", foreignKey);
        }

        // 2. Rename column transferId back to transactionId
        await queryRunner.renameColumn("disputes", "transferId", "transactionId");

        // 3. Restore foreign key to transactions table
        await queryRunner.createForeignKey("disputes", new TableForeignKey({
            columnNames: ["transactionId"],
            referencedColumnNames: ["id"],
            referencedTableName: "transactions",
            onDelete: "CASCADE"
        }));
    }

}
