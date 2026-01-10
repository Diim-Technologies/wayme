"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyStripePaymentMethods = verifyStripePaymentMethods;
const stripe_payment_method_entity_1 = require("../entities/stripe-payment-method.entity");
async function verifyStripePaymentMethods() {
    const AppDataSource = (await Promise.resolve().then(() => require('../config/typeorm.config'))).default;
    try {
        console.log('📦 Connecting to database...\n');
        await AppDataSource.initialize();
        console.log('✅ Database connection established\n');
        const repository = AppDataSource.getRepository(stripe_payment_method_entity_1.StripePaymentMethod);
        const totalCount = await repository.count();
        console.log(`📊 Total Stripe Payment Methods: ${totalCount}\n`);
        const categories = ['CARD', 'WALLET', 'BNPL', 'BANK_DEBIT', 'BANK_REDIRECT', 'BANK_TRANSFER', 'REAL_TIME', 'VOUCHER'];
        console.log('📋 Breakdown by Category:');
        for (const category of categories) {
            const count = await repository.count({ where: { category } });
            if (count > 0) {
                console.log(`  - ${category}: ${count}`);
            }
        }
        console.log('\n📝 All Payment Methods:');
        const allMethods = await repository.find({ order: { category: 'ASC', displayName: 'ASC' } });
        let currentCategory = '';
        for (const method of allMethods) {
            if (method.category !== currentCategory) {
                currentCategory = method.category;
                console.log(`\n  ${currentCategory}:`);
            }
            const inviteStatus = method.requiresInvite ? ' (Invite Only)' : '';
            const activeStatus = method.isActive ? '✓' : '✗';
            console.log(`    ${activeStatus} ${method.displayName} (${method.stripeType})${inviteStatus}`);
        }
        console.log('\n✅ Verification completed!\n');
        await AppDataSource.destroy();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during verification:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    verifyStripePaymentMethods();
}
//# sourceMappingURL=verify-stripe-payment-methods.js.map