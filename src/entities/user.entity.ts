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
import { Notification } from './notification.entity';
import { OTP } from './otp.entity';
import { PaymentMethod } from './payment-method.entity';
import { Transfer } from './transfer.entity';
import { Beneficiary } from './beneficiary.entity';
import { UserProfile } from './user-profile.entity';

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
    default: KycStatus.NOT_SUBMITTED,
  })
  kycStatus: KycStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => OTP, (otp) => otp.user)
  otps: OTP[];

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods: PaymentMethod[];

  @OneToMany(() => Transfer, (transfer) => transfer.receiver)
  receivedTransfers: Transfer[];

  @OneToMany(() => Transfer, (transfer) => transfer.sender)
  sentTransfers: Transfer[];

  @OneToMany(() => Beneficiary, (beneficiary) => beneficiary.user)
  beneficiaries: Beneficiary[];

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;
}