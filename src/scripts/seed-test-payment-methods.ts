import { DataSource } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { User } from '../entities/user.entity';
import { PaymentMethodType } from '../enums/common.enum';

// Sample payment methods data
const samplePaymentMethods = [
    // Card payment methods
    {
        type: PaymentMethodType.CARD,
        isDefault: true,
        cardDetails: {
            last4: '4242',
            brand: 'visa',
            expiryMonth: 12,
            expiryYear: 2025,
            country: 'US',
            funding: 'credit',
        },
        stripeId: 'pm_test_visa_4242',
        isActive: true,
    },
    {
        type: PaymentMethodType.CARD,
        isDefault: false,
        cardDetails: {
            last4: '5555',
            brand: 'mastercard',
            expiryMonth: 8,
            expiryYear: 2026,
            country: 'US',
            funding: 'debit',
        },
        stripeId: 'pm_test_mastercard_5555',
        isActive: true,
    },
    {
        type: PaymentMethodType.CARD,
        isDefault: false,
        cardDetails: {
            last4: '0005',
            brand: 'amex',
            expiryMonth: 3,
            expiryYear: 2027,
            country: 'US',
            funding: 'credit',
        },
        stripeId: 'pm_test_amex_0005',
        isActive: true,
    },
    // Bank transfer payment methods
    {
        type: PaymentMethodType.BANK_TRANSFER,
        isDefault: false,
        bankDetails: {
            accountNumber: '0123456789',
            bankName: 'Access Bank',
            bankCode: '044',
            accountName: 'Test User',
            country: 'NG',
            currency: 'NGN',
        },
        stripeId: 'pm_test_bank_access',
        isActive: true,
    },
    {
        type: PaymentMethodType.BANK_TRANSFER,
        isDefault: false,
        bankDetails: {
            accountNumber: '9876543210',
            bankName: 'GTBank',
            bankCode: '058',
            accountName: 'Test User',
            country: 'NG',
            currency: 'NGN',
        },
        stripeId: 'pm_test_bank_gtb',
        isActive: true,
    },
];

export async function seedTestPaymentMethods(dataSource: DataSource) {
    const userRepository = dataSource.getRepository(User);
    const paymentMethodRepository = dataSource.getRepository(PaymentMethod);

    console.log('🌱 Seeding test payment methods...\n');

    // Get all users
    const users = await userRepository.find({ take: 10 }); // Limit to first 10 users

    if (users.length === 0) {
        console.log('⚠️  No users found in database. Please create users first.');
        console.log('   You can register users via POST /api/v1/auth/register\n');
        return { created: 0, skipped: 0, message: 'No users found' };
    }

    console.log(`📊 Found ${users.length} user(s) in database\n`);

    let created = 0;
    let skipped = 0;

    for (const user of users) {
        console.log(`\n👤 Processing user: ${user.email}`);

        // Check if user already has payment methods
        const existingMethods = await paymentMethodRepository.count({
            where: { userId: user.id },
        });

        if (existingMethods > 0) {
            console.log(`   ⏭️  User already has ${existingMethods} payment method(s), skipping...`);
            skipped++;
            continue;
        }

        // Randomly assign 2-4 payment methods to each user
        const numMethods = Math.floor(Math.random() * 3) + 2; // 2-4 methods
        const shuffled = [...samplePaymentMethods].sort(() => Math.random() - 0.5);
        const selectedMethods = shuffled.slice(0, numMethods);

        // Ensure only one is set as default
        selectedMethods.forEach((method, index) => {
            method.isDefault = index === 0;
        });

        for (const methodData of selectedMethods) {
            try {
                const paymentMethod = paymentMethodRepository.create({
                    ...methodData,
                    userId: user.id,
                });

                await paymentMethodRepository.save(paymentMethod);

                const methodType = methodData.type === PaymentMethodType.CARD
                    ? `${methodData.cardDetails.brand} ****${methodData.cardDetails.last4}`
                    : `${methodData.bankDetails.bankName} ${methodData.bankDetails.accountNumber.slice(-4)}`;

                console.log(`   ✓ Added: ${methodType}${methodData.isDefault ? ' (default)' : ''}`);
                created++;
            } catch (error) {
                console.error(`   ✗ Error adding payment method:`, error.message);
            }
        }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`  - Users processed: ${users.length}`);
    console.log(`  - Payment methods created: ${created}`);
    console.log(`  - Users skipped (already have methods): ${skipped}`);
    console.log('\n✅ Test payment methods seeding completed!\n');

    return { created, skipped, usersProcessed: users.length };
}

// Standalone execution
if (require.main === module) {
    import('../config/typeorm.config').then(async (module) => {
        const AppDataSource = module.default;

        // Enable synchronize to ensure tables exist
        AppDataSource.setOptions({ synchronize: true });

        try {
            await AppDataSource.initialize();
            console.log('📦 Database connection established\n');

            await seedTestPaymentMethods(AppDataSource);

            await AppDataSource.destroy();
            console.log('👋 Database connection closed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error seeding test payment methods:', error);
            process.exit(1);
        }
    });
}
