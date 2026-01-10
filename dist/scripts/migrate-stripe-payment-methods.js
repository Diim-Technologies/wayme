"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateStripePaymentMethods = migrateStripePaymentMethods;
const stripe_payment_method_entity_1 = require("../entities/stripe-payment-method.entity");
const stripePaymentMethods = [
    {
        stripeType: 'card',
        displayName: 'Credit/Debit Card',
        category: 'CARD',
        description: 'Accept major credit and debit cards including Visa, Mastercard, American Express, Discover, JCB, and more',
        supportedCountries: ['GLOBAL'],
        supportedCurrencies: ['ALL'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'cartes_bancaires',
        displayName: 'Cartes Bancaires',
        category: 'CARD',
        description: 'French local card network',
        supportedCountries: ['FR'],
        supportedCurrencies: ['EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'apple_pay',
        displayName: 'Apple Pay',
        category: 'WALLET',
        description: 'Fast and secure payments with Apple Pay',
        supportedCountries: ['GLOBAL'],
        supportedCurrencies: ['ALL'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'google_pay',
        displayName: 'Google Pay',
        category: 'WALLET',
        description: 'Fast and secure payments with Google Pay',
        supportedCountries: ['GLOBAL'],
        supportedCurrencies: ['ALL'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'paypal',
        displayName: 'PayPal',
        category: 'WALLET',
        description: 'Accept payments via PayPal',
        supportedCountries: ['GLOBAL'],
        supportedCurrencies: ['ALL'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'alipay',
        displayName: 'Alipay',
        category: 'WALLET',
        description: 'Popular Chinese digital wallet',
        supportedCountries: ['CN', 'HK', 'GLOBAL'],
        supportedCurrencies: ['CNY', 'HKD', 'USD', 'EUR', 'GBP'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'wechat_pay',
        displayName: 'WeChat Pay',
        category: 'WALLET',
        description: 'Popular Chinese mobile payment platform',
        supportedCountries: ['CN', 'GLOBAL'],
        supportedCurrencies: ['CNY', 'USD', 'EUR', 'GBP'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'cash_app',
        displayName: 'Cash App Pay',
        category: 'WALLET',
        description: 'Mobile payment service by Square',
        supportedCountries: ['US'],
        supportedCurrencies: ['USD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'link',
        displayName: 'Link',
        category: 'WALLET',
        description: 'Stripe\'s one-click checkout solution',
        supportedCountries: ['GLOBAL'],
        supportedCurrencies: ['ALL'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'revolut_pay',
        displayName: 'Revolut Pay',
        category: 'WALLET',
        description: 'Digital banking and payment service',
        supportedCountries: ['EU', 'UK', 'US'],
        supportedCurrencies: ['EUR', 'GBP', 'USD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'grabpay',
        displayName: 'GrabPay',
        category: 'WALLET',
        description: 'Southeast Asian mobile wallet',
        supportedCountries: ['SG', 'MY', 'PH', 'TH', 'VN', 'ID'],
        supportedCurrencies: ['SGD', 'MYR', 'PHP', 'THB', 'VND', 'IDR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'mobilepay',
        displayName: 'MobilePay',
        category: 'WALLET',
        description: 'Nordic mobile payment solution',
        supportedCountries: ['DK', 'FI'],
        supportedCurrencies: ['DKK', 'EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'kakao_pay',
        displayName: 'Kakao Pay',
        category: 'WALLET',
        description: 'South Korean mobile payment service',
        supportedCountries: ['KR'],
        supportedCurrencies: ['KRW'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'naver_pay',
        displayName: 'Naver Pay',
        category: 'WALLET',
        description: 'South Korean online payment service',
        supportedCountries: ['KR'],
        supportedCurrencies: ['KRW'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'samsung_pay',
        displayName: 'Samsung Pay',
        category: 'WALLET',
        description: 'Samsung\'s mobile payment platform',
        supportedCountries: ['KR', 'GLOBAL'],
        supportedCurrencies: ['KRW', 'USD', 'EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'payco',
        displayName: 'PayCo',
        category: 'WALLET',
        description: 'South Korean payment service',
        supportedCountries: ['KR'],
        supportedCurrencies: ['KRW'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'satispay',
        displayName: 'Satispay',
        category: 'WALLET',
        description: 'Italian mobile payment service',
        supportedCountries: ['IT', 'LU', 'DE', 'FR'],
        supportedCurrencies: ['EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'klarna',
        displayName: 'Klarna',
        category: 'BNPL',
        description: 'Buy now, pay later in installments',
        supportedCountries: ['US', 'GB', 'DE', 'AT', 'NL', 'BE', 'ES', 'IT', 'FR', 'FI', 'NO', 'SE', 'DK'],
        supportedCurrencies: ['USD', 'GBP', 'EUR', 'SEK', 'NOK', 'DKK'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'afterpay_clearpay',
        displayName: 'Afterpay / Clearpay',
        category: 'BNPL',
        description: 'Interest-free installment payments',
        supportedCountries: ['US', 'CA', 'GB', 'AU', 'NZ', 'ES', 'FR', 'IT'],
        supportedCurrencies: ['USD', 'CAD', 'GBP', 'AUD', 'NZD', 'EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'affirm',
        displayName: 'Affirm',
        category: 'BNPL',
        description: 'Flexible payment plans',
        supportedCountries: ['US', 'CA'],
        supportedCurrencies: ['USD', 'CAD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'zip',
        displayName: 'Zip',
        category: 'BNPL',
        description: 'Pay in 4 interest-free installments',
        supportedCountries: ['US', 'AU', 'NZ', 'GB'],
        supportedCurrencies: ['USD', 'AUD', 'NZD', 'GBP'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'us_bank_account',
        displayName: 'ACH Direct Debit',
        category: 'BANK_DEBIT',
        description: 'US bank account direct debit via ACH',
        supportedCountries: ['US'],
        supportedCurrencies: ['USD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'sepa_debit',
        displayName: 'SEPA Direct Debit',
        category: 'BANK_DEBIT',
        description: 'European bank account direct debit',
        supportedCountries: ['EU', 'SEPA'],
        supportedCurrencies: ['EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'bacs_debit',
        displayName: 'Bacs Direct Debit',
        category: 'BANK_DEBIT',
        description: 'UK bank account direct debit',
        supportedCountries: ['GB'],
        supportedCurrencies: ['GBP'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'au_becs_debit',
        displayName: 'AU BECS Direct Debit',
        category: 'BANK_DEBIT',
        description: 'Australian bank account direct debit',
        supportedCountries: ['AU'],
        supportedCurrencies: ['AUD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'acss_debit',
        displayName: 'Canadian PADs',
        category: 'BANK_DEBIT',
        description: 'Canadian Pre-Authorized Debits',
        supportedCountries: ['CA'],
        supportedCurrencies: ['CAD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'nz_becs_debit',
        displayName: 'NZ BECS Direct Debit',
        category: 'BANK_DEBIT',
        description: 'New Zealand bank account direct debit',
        supportedCountries: ['NZ'],
        supportedCurrencies: ['NZD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'ideal',
        displayName: 'iDEAL',
        category: 'BANK_REDIRECT',
        description: 'Dutch online banking payment method',
        supportedCountries: ['NL'],
        supportedCurrencies: ['EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'bancontact',
        displayName: 'Bancontact',
        category: 'BANK_REDIRECT',
        description: 'Belgian payment method',
        supportedCountries: ['BE'],
        supportedCurrencies: ['EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'eps',
        displayName: 'EPS',
        category: 'BANK_REDIRECT',
        description: 'Austrian online banking payment',
        supportedCountries: ['AT'],
        supportedCurrencies: ['EUR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'fpx',
        displayName: 'FPX',
        category: 'BANK_REDIRECT',
        description: 'Malaysian online banking',
        supportedCountries: ['MY'],
        supportedCurrencies: ['MYR'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'p24',
        displayName: 'Przelewy24',
        category: 'BANK_REDIRECT',
        description: 'Polish online banking payment',
        supportedCountries: ['PL'],
        supportedCurrencies: ['EUR', 'PLN'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'blik',
        displayName: 'BLIK',
        category: 'BANK_REDIRECT',
        description: 'Polish mobile payment system',
        supportedCountries: ['PL'],
        supportedCurrencies: ['PLN'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'twint',
        displayName: 'TWINT',
        category: 'BANK_REDIRECT',
        description: 'Swiss mobile payment solution',
        supportedCountries: ['CH'],
        supportedCurrencies: ['CHF'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'customer_balance',
        displayName: 'Bank Transfer',
        category: 'BANK_TRANSFER',
        description: 'Direct bank transfer to your account',
        supportedCountries: ['GLOBAL'],
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'MXN'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'pix',
        displayName: 'Pix',
        category: 'REAL_TIME',
        description: 'Brazilian instant payment system',
        supportedCountries: ['BR'],
        supportedCurrencies: ['BRL'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'swish',
        displayName: 'Swish',
        category: 'REAL_TIME',
        description: 'Swedish mobile payment system',
        supportedCountries: ['SE'],
        supportedCurrencies: ['SEK'],
        isActive: true,
        requiresInvite: true,
    },
    {
        stripeType: 'paynow',
        displayName: 'PayNow',
        category: 'REAL_TIME',
        description: 'Singapore instant payment service',
        supportedCountries: ['SG'],
        supportedCurrencies: ['SGD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'promptpay',
        displayName: 'PromptPay',
        category: 'REAL_TIME',
        description: 'Thai instant payment service',
        supportedCountries: ['TH'],
        supportedCurrencies: ['THB'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'payto',
        displayName: 'PayTo',
        category: 'REAL_TIME',
        description: 'Australian real-time payment service',
        supportedCountries: ['AU'],
        supportedCurrencies: ['AUD'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'oxxo',
        displayName: 'OXXO',
        category: 'VOUCHER',
        description: 'Mexican cash payment voucher',
        supportedCountries: ['MX'],
        supportedCurrencies: ['MXN'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'boleto',
        displayName: 'Boleto',
        category: 'VOUCHER',
        description: 'Brazilian payment voucher',
        supportedCountries: ['BR'],
        supportedCurrencies: ['BRL'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'konbini',
        displayName: 'Konbini',
        category: 'VOUCHER',
        description: 'Japanese convenience store payment',
        supportedCountries: ['JP'],
        supportedCurrencies: ['JPY'],
        isActive: true,
        requiresInvite: false,
    },
    {
        stripeType: 'multibanco',
        displayName: 'Multibanco',
        category: 'VOUCHER',
        description: 'Portuguese payment voucher',
        supportedCountries: ['PT'],
        supportedCurrencies: ['EUR'],
        isActive: true,
        requiresInvite: false,
    },
];
async function migrateStripePaymentMethods() {
    const AppDataSource = (await Promise.resolve().then(() => require('../config/typeorm.config'))).default;
    try {
        console.log('📦 Connecting to database...\n');
        await AppDataSource.initialize();
        console.log('✅ Database connection established\n');
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const tableExists = await queryRunner.hasTable('stripe_payment_methods');
            if (!tableExists) {
                console.log('📋 Creating stripe_payment_methods table...\n');
                await queryRunner.query(`
                    CREATE TABLE IF NOT EXISTS stripe_payment_methods (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        "stripeType" VARCHAR NOT NULL UNIQUE,
                        "displayName" VARCHAR NOT NULL,
                        category VARCHAR NOT NULL,
                        description TEXT,
                        "supportedCountries" TEXT,
                        "supportedCurrencies" TEXT,
                        "isActive" BOOLEAN DEFAULT true,
                        "requiresInvite" BOOLEAN DEFAULT false,
                        "logoUrl" VARCHAR,
                        metadata JSONB,
                        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                await queryRunner.query(`
                    CREATE INDEX IF NOT EXISTS "IDX_stripe_payment_methods_stripeType" 
                    ON stripe_payment_methods ("stripeType")
                `);
                await queryRunner.query(`
                    CREATE INDEX IF NOT EXISTS "IDX_stripe_payment_methods_category" 
                    ON stripe_payment_methods (category)
                `);
                console.log('✅ Table created successfully\n');
            }
            else {
                console.log('✅ Table already exists\n');
            }
            console.log('🌱 Seeding Stripe payment methods...\n');
            const repository = AppDataSource.getRepository(stripe_payment_method_entity_1.StripePaymentMethod);
            let created = 0;
            let updated = 0;
            let skipped = 0;
            for (const methodData of stripePaymentMethods) {
                try {
                    const existing = await repository.findOne({
                        where: { stripeType: methodData.stripeType },
                    });
                    if (existing) {
                        await repository.update(existing.id, methodData);
                        updated++;
                        console.log(`  ✓ Updated: ${methodData.displayName}`);
                    }
                    else {
                        const method = repository.create(methodData);
                        await repository.save(method);
                        created++;
                        console.log(`  ✓ Created: ${methodData.displayName}`);
                    }
                }
                catch (error) {
                    console.error(`  ✗ Error processing ${methodData.displayName}:`, error.message);
                    skipped++;
                }
            }
            console.log('\n📊 Migration Summary:');
            console.log(`  - Created: ${created}`);
            console.log(`  - Updated: ${updated}`);
            console.log(`  - Skipped: ${skipped}`);
            console.log(`  - Total: ${stripePaymentMethods.length}`);
            console.log('\n✅ Stripe payment methods migration completed!\n');
        }
        finally {
            await queryRunner.release();
        }
        await AppDataSource.destroy();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    migrateStripePaymentMethods();
}
//# sourceMappingURL=migrate-stripe-payment-methods.js.map