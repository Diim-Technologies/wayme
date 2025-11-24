import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request, Headers, RawBodyRequest, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { AddCardDto, AddBankAccountDto } from './dto/payments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StripeWebhookService } from '../common/services/stripe-webhook.service';
import { StripeService } from '../common/services/stripe.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private stripeWebhookService: StripeWebhookService,
    private stripeService: StripeService,
  ) {}

  @Get('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user payment methods',
    description: 'Retrieve all active payment methods (cards and bank accounts) for the authenticated user, ordered by default status.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment methods retrieved successfully',
    example: [
      {
        id: 'pm_123',
        type: 'CARD',
        isDefault: true,
        cardDetails: {
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025
        },
        createdAt: '2024-11-14T10:00:00Z'
      }
    ]
  })
  async getPaymentMethods(@Request() req) {
    return this.paymentsService.getUserPaymentMethods(req.user.id);
  }

  @Post('methods/card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Add card payment method (Direct - Not Recommended)',
    description: 'Add a card directly to the user account. This method is not PCI compliant and should not be used in production. Use setup-intent method instead.'
  })
  @ApiResponse({ status: 201, description: 'Card added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid card details or card declined' })
  async addCard(@Request() req, @Body() addCardDto: AddCardDto) {
    return this.paymentsService.addCardPaymentMethod(req.user.id, addCardDto);
  }

  @Post('methods/card/setup-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create setup intent for adding card (PCI Compliant - Recommended)',
    description: 'Create a Stripe SetupIntent for securely adding a card using Stripe Elements on the frontend. This is the PCI compliant way to collect card details.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Setup intent created successfully',
    example: {
      setupIntentId: 'seti_1234567890',
      clientSecret: 'seti_1234567890_secret_abcd',
      customerId: 'cus_1234567890'
    }
  })
  async createCardSetupIntent(@Request() req) {
    return this.paymentsService.addCardPaymentMethodWithSetupIntent(req.user.id);
  }

  @Post('methods/card/confirm-setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Confirm setup intent after client-side completion',
    description: 'Confirm that the setup intent was completed successfully on the client side and save the payment method to the user account.'
  })
  @ApiResponse({ status: 201, description: 'Payment method added successfully' })
  @ApiResponse({ status: 400, description: 'Setup intent not completed or failed' })
  async confirmCardSetup(
    @Request() req,
    @Body() body: { setupIntentId: string },
  ) {
    return this.paymentsService.confirmSetupIntent(req.user.id, body.setupIntentId);
  }

  @Post('methods/bank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Add Nigerian bank account payment method',
    description: 'Add and verify a Nigerian bank account using Paystack verification. The account will be verified before being saved.'
  })
  @ApiResponse({ status: 201, description: 'Bank account added and verified successfully' })
  @ApiResponse({ status: 400, description: 'Bank account verification failed or invalid details' })
  async addBankAccount(@Request() req, @Body() addBankAccountDto: AddBankAccountDto) {
    return this.paymentsService.addBankPaymentMethod(req.user.id, addBankAccountDto);
  }

  @Post('intents/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create payment intent for processing payments',
    description: 'Create a Stripe PaymentIntent for processing a payment. Use this for one-time payments or when you need more control over the payment flow.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment intent created successfully',
    example: {
      paymentIntentId: 'pi_1234567890',
      clientSecret: 'pi_1234567890_secret_abcd',
      status: 'requires_confirmation'
    }
  })
  async createPaymentIntent(
    @Request() req,
    @Body() body: {
      amount: number;
      currency: string;
      paymentMethodId?: string;
      transferId?: string;
    },
  ) {
    return this.paymentsService.createPaymentIntent(
      req.user.id,
      body.amount,
      body.currency,
      body.paymentMethodId,
      body.transferId,
    );
  }

  @Post('intents/:id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Confirm payment intent',
    description: 'Confirm a PaymentIntent to complete the payment. May trigger 3D Secure authentication if required.'
  })
  @ApiResponse({ status: 200, description: 'Payment intent confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Payment confirmation failed or requires additional authentication' })
  async confirmPaymentIntent(
    @Param('id') paymentIntentId: string,
    @Body() body: { paymentMethodId?: string },
  ) {
    return this.paymentsService.confirmPaymentIntent(
      paymentIntentId,
      body.paymentMethodId,
    );
  }

  @Get('intents/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get payment intent status',
    description: 'Check the current status of a PaymentIntent, including any errors or authentication requirements.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment intent status retrieved successfully',
    example: {
      paymentIntentId: 'pi_1234567890',
      status: 'succeeded',
      amount: 10000,
      currency: 'ngn',
      lastPaymentError: null
    }
  })
  async getPaymentIntentStatus(@Param('id') paymentIntentId: string) {
    return this.paymentsService.getPaymentIntentStatus(paymentIntentId);
  }

  @Post('refunds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create refund for a payment',
    description: 'Process a refund for a completed payment. Can be partial or full refund depending on the amount specified.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Refund created successfully',
    example: {
      refundId: 're_1234567890',
      amount: 5000,
      status: 'succeeded',
      reason: 'requested_by_customer'
    }
  })
  async createRefund(
    @Request() req,
    @Body() body: {
      paymentIntentId: string;
      amount?: number;
      reason?: string;
    },
  ) {
    return this.paymentsService.refundPayment(
      body.paymentIntentId,
      body.amount,
      body.reason,
    );
  }

  @Patch('methods/:id/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Set default payment method',
    description: 'Set a payment method as the default for future transactions. This will unset any other default payment methods.'
  })
  @ApiResponse({ status: 200, description: 'Default payment method updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found or does not belong to user' })
  async setDefaultPaymentMethod(@Request() req, @Param('id') id: string) {
    return this.paymentsService.setDefaultPaymentMethod(req.user.id, id);
  }

  @Delete('methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Remove payment method',
    description: 'Remove a payment method from the user account. Cannot remove payment methods that have pending transfers.'
  })
  @ApiResponse({ status: 200, description: 'Payment method removed successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 400, description: 'Cannot remove payment method with pending transfers' })
  async removePaymentMethod(@Request() req, @Param('id') id: string) {
    return this.paymentsService.removePaymentMethod(req.user.id, id);
  }

  // Stripe Webhook Endpoint
  @Post('webhooks/stripe')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Stripe webhook endpoint (No Authentication Required)',
    description: 'Webhook endpoint for receiving Stripe events. This endpoint processes payment status updates, disputes, and other payment-related events automatically.'
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature or malformed payload' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = this.stripeService.constructWebhookEvent(req.rawBody, signature);
      await this.stripeWebhookService.handleWebhookEvent(event);
      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }
}