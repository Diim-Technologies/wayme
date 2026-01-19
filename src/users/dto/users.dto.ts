


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsOptional, IsDateString } from 'class-validator';

export class UpdateProfileDto {
	@ApiPropertyOptional({ example: 'john.doe@example.com' })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({ example: 'John' })
	@IsOptional()
	@IsString()
	@MinLength(2)
	firstName?: string;

	@ApiPropertyOptional({ example: 'Doe' })
	@IsOptional()
	@IsString()
	@MinLength(2)
	lastName?: string;

	@ApiPropertyOptional({ example: '+2348123456789', description: 'Phone number in E.164 format (e.g., +2348123456789 for Nigeria, +1234567890 for US)' })
	@IsOptional()
	@IsString()
	@Matches(/^\+[1-9]\d{1,14}$/, {
		message: 'Phone number must be in valid international format (E.164): start with + followed by country code and number (e.g., +2348123456789)',
	})
	phoneNumber?: string;

	@ApiPropertyOptional({ example: '1990-01-01', description: 'Date of birth (YYYY-MM-DD)' })
	@IsOptional()
	@IsDateString()
	dateOfBirth?: Date;

	@ApiPropertyOptional({ example: '123 Main St' })
	@IsOptional()
	@IsString()
	address?: string;

	@ApiPropertyOptional({ example: 'Lagos' })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ example: 'Lagos' })
	@IsOptional()
	@IsString()
	state?: string;

	@ApiPropertyOptional({ example: 'NG', description: 'Country code (default NG)' })
	@IsOptional()
	@IsString()
	country?: string;

	@ApiPropertyOptional({ example: '100001' })
	@IsOptional()
	@IsString()
	postalCode?: string;

	@ApiPropertyOptional({ example: 'Engineer' })
	@IsOptional()
	@IsString()
	occupation?: string;

	@ApiPropertyOptional({ example: 'NIN' })
	@IsOptional()
	@IsString()
	idType?: string;

	@ApiPropertyOptional({ example: '1234567890' })
	@IsOptional()
	@IsString()
	idNumber?: string;

	@ApiPropertyOptional({ example: 'https://example.com/id.jpg' })
	@IsOptional()
	@IsString()
	idImageUrl?: string;

	@ApiPropertyOptional({ example: 'https://example.com/selfie.jpg' })
	@IsOptional()
	@IsString()
	selfieUrl?: string;
}