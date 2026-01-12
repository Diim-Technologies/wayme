"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddKycAndDisputesManual1768213734457 = void 0;
class AddKycAndDisputesManual1768213734457 {
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "kyc_documents" (
                "id" character varying(255) NOT NULL DEFAULT uuid_generate_v4(),
                "userId" character varying(255) NOT NULL,
                "documentType" character varying NOT NULL,
                "filePath" character varying NOT NULL,
                "fileUrl" character varying NOT NULL,
                "fileName" character varying NOT NULL,
                "fileSize" integer NOT NULL,
                "mimeType" character varying NOT NULL,
                "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "isVerified" boolean NOT NULL DEFAULT false,
                "verifiedAt" TIMESTAMP,
                "verifiedBy" character varying(255),
                CONSTRAINT "PK_kyc_documents" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_kyc_documents_userId" ON "kyc_documents" ("userId")`);
        await queryRunner.query(`
            CREATE TABLE "disputes" (
                "id" character varying(255) NOT NULL DEFAULT uuid_generate_v4(),
                "transactionId" character varying(255) NOT NULL,
                "userId" character varying(255) NOT NULL,
                "category" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'OPEN',
                "subject" character varying NOT NULL,
                "description" text NOT NULL,
                "priority" character varying NOT NULL DEFAULT 'MEDIUM',
                "resolvedAt" TIMESTAMP,
                "resolvedBy" character varying(255),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_disputes" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_disputes_transactionId" ON "disputes" ("transactionId")`);
        await queryRunner.query(`CREATE INDEX "IDX_disputes_userId" ON "disputes" ("userId")`);
        await queryRunner.query(`
            CREATE TABLE "dispute_messages" (
                "id" character varying(255) NOT NULL DEFAULT uuid_generate_v4(),
                "disputeId" character varying(255) NOT NULL,
                "userId" character varying(255) NOT NULL,
                "message" text NOT NULL,
                "isAdminReply" boolean NOT NULL DEFAULT false,
                "attachments" json,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_dispute_messages" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_dispute_messages_disputeId" ON "dispute_messages" ("disputeId")`);
        await queryRunner.query(`CREATE INDEX "IDX_dispute_messages_userId" ON "dispute_messages" ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "kycSubmittedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "kycReviewedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "kycReviewedBy" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD "kycRejectionReason" text`);
        await queryRunner.query(`ALTER TABLE "kyc_documents" ADD CONSTRAINT "FK_kyc_documents_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD CONSTRAINT "FK_disputes_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "dispute_messages" ADD CONSTRAINT "FK_dispute_messages_disputeId" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "dispute_messages" ADD CONSTRAINT "FK_dispute_messages_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "kyc_documents" DROP CONSTRAINT "FK_kyc_documents_userId"`);
        await queryRunner.query(`ALTER TABLE "disputes" DROP CONSTRAINT "FK_disputes_userId"`);
        await queryRunner.query(`ALTER TABLE "dispute_messages" DROP CONSTRAINT "FK_dispute_messages_disputeId"`);
        await queryRunner.query(`ALTER TABLE "dispute_messages" DROP CONSTRAINT "FK_dispute_messages_userId"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "kycRejectionReason"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "kycReviewedBy"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "kycReviewedAt"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP COLUMN "kycSubmittedAt"`);
        await queryRunner.query(`DROP TABLE "dispute_messages"`);
        await queryRunner.query(`DROP TABLE "disputes"`);
        await queryRunner.query(`DROP TABLE "kyc_documents"`);
    }
}
exports.AddKycAndDisputesManual1768213734457 = AddKycAndDisputesManual1768213734457;
//# sourceMappingURL=1768213734457-AddKycAndDisputesManual.js.map