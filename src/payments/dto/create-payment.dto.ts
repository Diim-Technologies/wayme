import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({ example: 'WMT-1733403411000-ABC123', description: 'Transfer reference ID' })
    @IsString()
    transferReference: string;

    @ApiProperty({ required: false, description: 'Specific Stripe payment method type (optional)' })
    @IsOptional()
    @IsString()
    paymentMethodType?: string;
}

export class PaymentIntentResponseDto {
    @ApiProperty({ description: 'Stripe client secret for payment' })
    clientSecret: string;

    @ApiProperty({ description: 'Stripe payment intent ID' })
    paymentIntentId: string;

    @ApiProperty({ example: 1055, description: 'Total amount to pay' })
    amount: number;

    @ApiProperty({ example: 'ngn', description: 'Currency code (lowercase)' })
    currency: string;

    @ApiProperty({ example: 'WMT-1733403411000-ABC123' })
    transferReference: string;
}
