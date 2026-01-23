"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefactorDisputeToTransfer1768987589826 = void 0;
const typeorm_1 = require("typeorm");
class RefactorDisputeToTransfer1768987589826 {
    async up(queryRunner) {
        const table = await queryRunner.getTable("disputes");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("transactionId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("disputes", foreignKey);
        }
        await queryRunner.renameColumn("disputes", "transactionId", "transferId");
        await queryRunner.createForeignKey("disputes", new typeorm_1.TableForeignKey({
            columnNames: ["transferId"],
            referencedColumnNames: ["id"],
            referencedTableName: "transfers",
            onDelete: "CASCADE"
        }));
    }
    async down(queryRunner) {
        const table = await queryRunner.getTable("disputes");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("transferId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("disputes", foreignKey);
        }
        await queryRunner.renameColumn("disputes", "transferId", "transactionId");
        await queryRunner.createForeignKey("disputes", new typeorm_1.TableForeignKey({
            columnNames: ["transactionId"],
            referencedColumnNames: ["id"],
            referencedTableName: "transactions",
            onDelete: "CASCADE"
        }));
    }
}
exports.RefactorDisputeToTransfer1768987589826 = RefactorDisputeToTransfer1768987589826;
//# sourceMappingURL=1768987589826-RefactorDisputeToTransfer.js.map