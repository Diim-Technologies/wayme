import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('stripe_payment_methods')
export class StripePaymentMethod {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @Index()
    stripeType: string; // e.g., 'card', 'apple_pay', 'klarna', etc.

    @Column()
    displayName: string; // e.g., 'Credit/Debit Card', 'Apple Pay', 'Klarna'

    @Column()
    category: string; // e.g., 'CARD', 'WALLET', 'BNPL', 'BANK_DEBIT', 'BANK_REDIRECT', 'BANK_TRANSFER', 'REAL_TIME', 'VOUCHER'

    @Column('text', { nullable: true })
    description: string;

    @Column('simple-array', { nullable: true })
    supportedCountries: string[]; // ISO country codes

    @Column('simple-array', { nullable: true })
    supportedCurrencies: string[]; // ISO currency codes

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    requiresInvite: boolean; // Some payment methods are invite-only

    @Column({ nullable: true })
    logoUrl: string;

    @Column('json', { nullable: true })
    metadata: any; // Additional information like fees, limits, etc.

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
