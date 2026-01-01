import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeeType } from '../enums/common.enum';

@Entity('fees')
export class Fee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FeeType,
  })
  type: FeeType;

  @Column()
  name: string;

  @Column('decimal', { precision: 20, scale: 2, nullable: true })
  fixedAmount: number;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  percentageRate: number;



  @Column({ default: 'NGN' })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}