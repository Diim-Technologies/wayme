import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateStripePaymentMethodsManual1764861938882 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists to avoid errors
        const tableExists = await queryRunner.hasTable('stripe_payment_methods');
        if (tableExists) {
            return;
        }

        await queryRunner.createTable(
            new Table({
                name: 'stripe_payment_methods',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'stripeType',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'displayName',
                        type: 'varchar',
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'supportedCountries',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'supportedCurrencies',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'requiresInvite',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'logoUrl',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'stripe_payment_methods',
            new TableIndex({
                name: 'IDX_stripe_payment_methods_stripeType',
                columnNames: ['stripeType'],
            }),
        );

        await queryRunner.createIndex(
            'stripe_payment_methods',
            new TableIndex({
                name: 'IDX_stripe_payment_methods_category',
                columnNames: ['category'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('stripe_payment_methods');
        if (tableExists) {
            await queryRunner.dropTable('stripe_payment_methods');
        }
    }
}
