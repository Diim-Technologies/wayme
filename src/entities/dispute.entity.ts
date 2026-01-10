import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
    BeforeInsert,
} from 'typeorm';
import { DisputeStatus, DisputeCategory, DisputePriority } from '../enums/dispute.enum';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { DisputeMessage } from './dispute-message.entity';
import { randomUUID } from 'crypto';

@Entity('disputes')
export class Dispute {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = randomUUID();
        }
    }

    @Column()
    @Index()
    transactionId: string;

    @Column()
    @Index()
    userId: string;

    @Column({
        type: 'enum',
        enum: DisputeCategory,
    })
    category: DisputeCategory;

    @Column({
        type: 'enum',
        enum: DisputeStatus,
        default: DisputeStatus.OPEN,
    })
    @Index()
    status: DisputeStatus;

    @Column()
    subject: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: DisputePriority,
        default: DisputePriority.MEDIUM,
    })
    priority: DisputePriority;

    @Column({ type: 'timestamp', nullable: true })
    resolvedAt: Date;

    @Column({ nullable: true })
    resolvedBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Transaction, (transaction) => transaction.disputes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'transactionId' })
    transaction: Transaction;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'resolvedBy' })
    resolver: User;

    @OneToMany(() => DisputeMessage, (message) => message.dispute)
    messages: DisputeMessage[];
}
