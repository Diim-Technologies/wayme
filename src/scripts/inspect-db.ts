import { DataSource } from 'typeorm';

if (require.main === module) {
    import('../config/typeorm.config').then(async (module) => {
        const AppDataSource = module.default;
        try {
            await AppDataSource.initialize();
            console.log('DB Connected');

            const queryRunner = AppDataSource.createQueryRunner();

            const hasStripe = await queryRunner.hasTable('stripe_payment_methods');
            console.log(`Stripe Table: ${hasStripe}`);

            const hasPayment = await queryRunner.hasTable('payment_methods');
            console.log(`Payment Table: ${hasPayment}`);

            if (hasPayment) {
                const table = await queryRunner.getTable('payment_methods');
                const idCol = table.columns.find(c => c.name === 'id');
                console.log(`Payment ID Default: ${idCol?.default}`);
                console.log(`Payment ID Type: ${idCol?.type}`);
            }

            await AppDataSource.destroy();
            process.exit(0);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    });
}
