import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
  BeforeInsert,
} from 'typeorm';
import { UserRole, KycStatus } from '../enums/user.enum';
import { randomUUID } from 'crypto';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  @Index()
  phoneNumber: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.PENDING,
  })
  kycStatus: KycStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Notification', 'user')
  notifications: any[];

  @OneToMany('OTP', 'user')
  otps: any[];

  @OneToMany('PaymentMethod', 'user')
  paymentMethods: any[];

  @OneToMany('Transfer', 'receiver')
  receivedTransfers: any[];

  @OneToMany('Transfer', 'sender')
  sentTransfers: any[];

  @OneToOne('UserProfile', 'user')
  profile: any;
}