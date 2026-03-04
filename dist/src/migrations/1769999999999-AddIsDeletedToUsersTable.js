"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsDeletedToUsersTable1669999999999 = void 0;
class AddIsDeletedToUsersTable1669999999999 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "isDeleted" boolean DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isDeleted"`);
    }
}
exports.AddIsDeletedToUsersTable1669999999999 = AddIsDeletedToUsersTable1669999999999;
//# sourceMappingURL=1769999999999-AddIsDeletedToUsersTable.js.map