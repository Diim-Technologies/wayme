"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsEmailVerifiedToUsers1670000000000 = void 0;
class AddIsEmailVerifiedToUsers1670000000000 {
    constructor() {
        this.name = 'AddIsEmailVerifiedToUsers1670000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isEmailVerified"`);
    }
}
exports.AddIsEmailVerifiedToUsers1670000000000 = AddIsEmailVerifiedToUsers1670000000000;
//# sourceMappingURL=1766200000000-AddIsEmailVerifiedToUsers.js.map