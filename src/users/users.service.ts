import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProfile, Transfer } from '../entities';
import { UpdateProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) { }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        isVerified: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if profile exists
    let profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (profile) {
      // Update existing profile
      await this.userProfileRepository.update({ userId }, updateProfileDto);
      profile = await this.userProfileRepository.findOne({
        where: { userId },
      });
    } else {
      // Create new profile
      profile = this.userProfileRepository.create({
        userId,
        ...updateProfileDto,
      });
      await this.userProfileRepository.save(profile);
    }

    return profile;
  }

  async getProfile(userId: string) {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      ...profile,
      user: {
        id: profile.user.id,
        email: profile.user.email,
        firstName: profile.user.firstName,
        lastName: profile.user.lastName,
        phoneNumber: profile.user.phoneNumber,
        isVerified: profile.user.isVerified,
        kycStatus: profile.user.kycStatus,
      },
    };
  }

  async getTransferHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [transfers, total] = await Promise.all([
      this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.sentTransfers', 'sentTransfer')
        .leftJoinAndSelect('user.receivedTransfers', 'receivedTransfer')
        .leftJoinAndSelect('sentTransfer.receiver', 'sentReceiver')
        .leftJoinAndSelect('sentTransfer.recipientBank', 'sentRecipientBank')
        .leftJoinAndSelect('receivedTransfer.sender', 'receivedSender')
        .leftJoinAndSelect('receivedTransfer.recipientBank', 'receivedRecipientBank')
        .where('user.id = :userId', { userId })
        .orderBy('COALESCE(sentTransfer.createdAt, receivedTransfer.createdAt)', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany()
        .then(users => {
          const user = users[0];
          if (!user) return [];

          const allTransfers = [
            ...user.sentTransfers.map(t => ({ ...t, type: 'sent' })),
            ...user.receivedTransfers.map(t => ({ ...t, type: 'received' }))
          ];

          return allTransfers
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
        }),

      this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.sentTransfers', 'sentTransfer')
        .leftJoin('user.receivedTransfers', 'receivedTransfer')
        .where('user.id = :userId', { userId })
        .getCount()
    ]);

    return {
      transfers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }
}