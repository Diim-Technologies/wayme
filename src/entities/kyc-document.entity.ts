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
import { DocumentType } from '../enums/kyc.enum';
import { User } from './user.entity';
import { randomUUID } from 'crypto';

@Entity('kyc_documents')
export class KycDocument {
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
    userId: string;

    @Column({
        type: 'enum',
        enum: DocumentType,
    })
    documentType: DocumentType;

    @Column()
    filePath: string;

    @Column()
    fileUrl: string;

    @Column()
    fileName: string;

    @Column()
    fileSize: number;

    @Column()
    mimeType: string;

    @CreateDateColumn()
    uploadedAt: Date;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    verifiedAt: Date;

    @Column({ nullable: true })
    verifiedBy: string;

    // Relationships
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'verifiedBy' })
    verifier: User;
}
