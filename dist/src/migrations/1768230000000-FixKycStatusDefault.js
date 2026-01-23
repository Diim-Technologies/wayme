"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixKycStatusDefault1768230000000 = void 0;
class FixKycStatusDefault1768230000000 {
    constructor() {
        this.name = 'FixKycStatusDefault1768230000000';
    }
    async up(queryRunner) {
        console.log('🔧 Fixing KYC status default (VARCHAR)...');
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "kycStatus" SET DEFAULT 'NOT_SUBMITTED'`);
        await queryRunner.query(`
            UPDATE "users"
            SET "kycStatus" = 'NOT_SUBMITTED'
            WHERE "kycStatus" = 'PENDING'
            AND "id"::text NOT IN (
                SELECT DISTINCT "userId"::text 
                FROM "kyc_documents"
                WHERE "userId" IS NOT NULL
            )
        `);
        console.log('✅ KYC status fix completed');
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "kycStatus" SET DEFAULT 'PENDING'`);
    }
}
exports.FixKycStatusDefault1768230000000 = FixKycStatusDefault1768230000000;
//# sourceMappingURL=1768230000000-FixKycStatusDefault.js.map