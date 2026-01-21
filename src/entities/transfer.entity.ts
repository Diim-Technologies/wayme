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
import { Transaction } from './transaction.entity';
import { PaymentMethod } from './payment-method.entity';
import { User } from './user.entity';
import { Bank } from './bank.entity';
import { Dispute } from './dispute.entity';

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

  @Column('decimal', { precision: 20, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 2 })
  fee: number;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
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

  @Column({ nullable: true })
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

  @OneToMany(() => Transaction, (transaction) => transaction.transfer)
  transactions: Transaction[];

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.transfers)
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => User, (user) => user.receivedTransfers, { nullable: true })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @ManyToOne(() => Bank, (bank) => bank.transfers, { nullable: true })
  @JoinColumn({ name: 'recipientBankId' })
  recipientBank: Bank;

  @ManyToOne(() => User, (user) => user.sentTransfers)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @OneToMany(() => Dispute, (dispute) => dispute.transfer)
  disputes: Dispute[];
}