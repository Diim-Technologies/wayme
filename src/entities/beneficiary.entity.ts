import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { randomUUID } from 'crypto';

@Entity('beneficiaries')
export class Beneficiary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = randomUUID();
        }
    }

    @Column()
    userId: string;

    @Column()
    name: string;

    @Column()
    accountName: string;

    @Column()
    bankName: string;

    @Column()
    accountNumber: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.beneficiaries, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
