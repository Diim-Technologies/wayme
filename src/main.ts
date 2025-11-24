import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for webhooks
  });

  // Get config service
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Enhanced Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Wayame API Documentation')
    .setDescription(`
# Wayame - Nigerian Money Transfer API

**Send money home easily and securely with integrated Stripe payments**

## Features
- 🔐 JWT Authentication & Authorization
- 💳 Stripe Payment Processing with Webhooks
- 🏦 Nigerian Bank Account Verification (Paystack)
- 💱 Real-time Exchange Rates
- 📊 Admin Dashboard & Management
- 📱 Mobile-friendly API Design
- 🔔 Real-time Notifications

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer your_jwt_token_here
\`\`\`

## Base URL
**Development:** \`http://localhost:3000/api/v1\`
**Production:** \`https://your-domain.com/api/v1\`

## Webhook Endpoints
- **Stripe Webhooks:** \`POST /payments/webhooks/stripe\` (No auth required)

## Rate Limiting
- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes
- Admin endpoints: 500 requests per 15 minutes
    `)
    .setVersion('1.0.0')
    .setContact(
      'Wayame Support',
      'https://wayame.com/support',
      'support@wayame.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User registration, login, and JWT token management')
    .addTag('Users', 'User profile management and KYC operations')
    .addTag('Payments', '💳 Stripe payment processing, webhooks, and payment methods')
    .addTag('Transfers', '💸 Money transfers with real-time tracking')
    .addTag('Banks', '🏦 Nigerian bank information and verification')
    .addTag('Notifications', '🔔 User notifications and messaging')
    .addTag('Admin', '👑 Administrative operations (Admin/Super Admin only)')
    .addTag('Admin - Dashboard', '📊 Dashboard statistics and analytics')
    .addTag('Admin - User Management', '👥 User management and KYC approval')
    .addTag('Admin - Transfer Management', '💸 Transfer oversight and status updates')
    .addTag('Admin - Exchange Rates', '💱 Currency exchange rate management')
    .addTag('Admin - Fee Configuration', '💰 Fee structure configuration')
    .addTag('Admin - System Settings', '⚙️ System-wide settings management')
    .addServer('http://localhost:3000/api/v1', 'Development server')
    .addServer('https://api.wayame.com/v1', 'Production server')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger UI with better configuration
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      displayOperationId: false,
      displayRequestDuration: true,
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      defaultModelRendering: 'example'
    },
    customSiteTitle: 'Wayame API Documentation',
    customfavIcon: '/favicon.ico'
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Wayame API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`💳 Stripe webhooks endpoint: http://localhost:${port}/api/v1/payments/webhooks/stripe`);
  console.log(`🔧 Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();