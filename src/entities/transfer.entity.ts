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
import { TransferStatus } from '../enums/common.enum';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  senderId: string;

  @Column({ nullable: true })
  @Index()
  receiverId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  fee: number;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  exchangeRate: number;

  @Column({ default: 'NGN' })
  sourceCurrency: string;

  @Column({ default: 'NGN' })
  targetCurrency: string;

  @Column()
  purpose: string;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column({ unique: true })
  reference: string;

  @Column()
  @Index()
  paymentMethodId: string;

  @Column({ nullable: true })
  @Index()
  recipientBankId: string;

  @Column({ nullable: true })
  recipientAccount: string;

  @Column({ nullable: true })
  recipientName: string;

  @Column({ nullable: true })
  recipientPhone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Transaction', 'transfer')
  transactions: any[];

  @ManyToOne('PaymentMethod', 'transfers')
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: any;

  @ManyToOne('User', 'receivedTransfers', { nullable: true })
  @JoinColumn({ name: 'receiverId' })
  receiver: any;

  @ManyToOne('Bank', 'transfers', { nullable: true })
  @JoinColumn({ name: 'recipientBankId' })
  recipientBank: any;

  @ManyToOne('User', 'sentTransfers')
  @JoinColumn({ name: 'senderId' })
  sender: any;
}