import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { Dispute } from './dispute.entity';
import { randomUUID } from 'crypto';

@Entity('dispute_messages')
export class DisputeMessage {
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
    disputeId: string;

    @Column()
    @Index()
    userId: string;

    @Column('text')
    message: string;

    @Column({ default: false })
    isAdminReply: boolean;

    @Column({ type: 'json', nullable: true })
    attachments: string[];

    @CreateDateColumn()
    createdAt: Date;

    // Relationships
    @ManyToOne(() => Dispute, (dispute) => dispute.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'disputeId' })
    dispute: Dispute;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
