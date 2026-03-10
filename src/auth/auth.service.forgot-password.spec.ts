import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, OTP } from '../entities';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../common/services/email.service';
import { Repository } from 'typeorm';
import { OTPType } from '../enums/common.enum';

describe('AuthService - forgotPassword', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let otpRepository: Repository<OTP>;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(OTP), useValue: { create: jest.fn(), save: jest.fn() } },
        { provide: JwtService, useValue: {} },
        { provide: EmailService, useValue: { sendPasswordResetOTP: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    otpRepository = module.get<Repository<OTP>>(getRepositoryToken(OTP));
    emailService = module.get<EmailService>(EmailService);
  });

  it('should return account not found for soft-deleted user', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ isDeleted: true });
    const result = await service.forgotPassword({ email: 'deleted@example.com' });
    expect(result.message).toBe('Account not found.');
  });

  it('should return account not found for non-existent user', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);
    const result = await service.forgotPassword({ email: 'nouser@example.com' });
    expect(result.message).toBe('Account not found.');
  });

  it('should send OTP for active user', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: '1', email: 'active@example.com', firstName: 'Active', isDeleted: false });
    (otpRepository.create as jest.Mock).mockReturnValue({});
    (otpRepository.save as jest.Mock).mockResolvedValue({});
    (emailService.sendPasswordResetOTP as jest.Mock).mockResolvedValue(undefined);
    const result = await service.forgotPassword({ email: 'active@example.com' });
    expect(result.message).toContain('password reset code');
  });
});
