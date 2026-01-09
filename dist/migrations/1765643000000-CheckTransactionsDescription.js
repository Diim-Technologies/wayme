"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckTransactionsDescription1765643000000 = void 0;
class CheckTransactionsDescription1765643000000 {
    constructor() {
        this.name = 'CheckTransactionsDescription1765643000000';
    }
    async up(queryRunner) {
        const hasDescription = await queryRunner.hasColumn("transactions", "description");
        if (!hasDescription) {
            console.log('Adding missing description column to transactions');
            await queryRunner.query(`ALTER TABLE "transactions" ADD "description" text`);
        }
        else {
            console.log('Description column already exists in transactions');
        }
    }
    async down(queryRunner) {
    }
}
exports.CheckTransactionsDescription1765643000000 = CheckTransactionsDescription1765643000000;
//# sourceMappingURL=1765643000000-CheckTransactionsDescription.js.map