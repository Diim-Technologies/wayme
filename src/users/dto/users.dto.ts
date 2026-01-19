

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { UserProfile } from '../../entities/user-profile.entity';

export class UpdateProfileDto extends PartialType(UserProfile) {}