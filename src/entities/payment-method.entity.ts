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
import { PaymentMethodType } from '../enums/common.enum';
import { User } from './user.entity';
import { Transfer } from './transfer.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
  })
  type: PaymentMethodType;

  @Column({ default: false })
  isDefault: boolean;

  @Column('json', { nullable: true })
  cardDetails: any;

  @Column('json', { nullable: true })
  bankDetails: any;

  @Column({ nullable: true })
  stripeId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.paymentMethods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transfer, (transfer) => transfer.paymentMethod)
  transfers: Transfer[];
}