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
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentIntentResponseDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

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
    @Req() req: RawBodyRequest<any>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const event = this.paymentsService.constructWebhookEvent(
        req.rawBody,
        signature,
      );
      await this.paymentsService.handleWebhookEvent(event);
      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
  }
}
