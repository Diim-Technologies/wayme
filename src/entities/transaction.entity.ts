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
} from 'typeorm';
import { TransactionType, TransactionStatus } from '../enums/common.enum';
import { Transfer } from './transfer.entity';
import { Dispute } from './dispute.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  transferId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('decimal', { precision: 20, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ unique: true })
  reference: string;

  @Column({ nullable: true })
  gatewayRef: string;

  @Column('json', { nullable: true })
  gatewayData: any;

  @Column('text', { nullable: true })
  gatewayResponse: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('json', { nullable: true })
  metadata: any;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Transfer, (transfer) => transfer.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transferId' })
  transfer: Transfer;

  @OneToMany(() => Dispute, (dispute) => dispute.transaction)
  disputes: Dispute[];
}
