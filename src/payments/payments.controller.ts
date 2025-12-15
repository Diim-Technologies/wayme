import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentIntentResponseDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent for transfer' })
  @ApiResponse({ status: 201, description: 'Payment intent created', type: PaymentIntentResponseDto })
  @ApiResponse({ status: 404, description: 'Transfer not found' })
  async createPaymentIntent(
    @Request() req,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentsService.createPaymentIntent(req.user.id, dto);
  }

  @Get('methods')

  @ApiOperation({ summary: 'Get all available Stripe payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getAvailablePaymentMethods() {
    return this.paymentsService.getAvailablePaymentMethods();
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Note: This requires raw body parser configuration
    // The webhook will be handled by a separate webhook service
    // For now, this is a placeholder
    return { received: true };
  }
}
