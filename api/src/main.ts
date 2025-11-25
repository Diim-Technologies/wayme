import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Wayame API')
    .setDescription(`
      Wayame is a comprehensive financial services API built with NestJS that provides secure payment processing, 
      money transfers, and user management capabilities. The API integrates with multiple payment providers 
      including Stripe and Paystack to offer seamless financial transactions.
      
      ## Features
      - 🔐 JWT Authentication & Authorization
      - 💳 Payment Processing (Stripe & Paystack)
      - 💸 Money Transfers
      - 🏦 Bank Account Management
      - 📧 Email Notifications & OTP Verification
      - 👤 User Profile Management
      - 🔔 Real-time Notifications
      - 👨‍💼 Admin Dashboard & Analytics
      
      ## Authentication
      Most endpoints require authentication. To authenticate:
      1. Register or login to receive a JWT token
      2. Click the 'Authorize' button below
      3. Enter: Bearer <your-jwt-token>
      
      ## Rate Limiting
      - 100 requests per minute per IP address
      - Rate limit headers included in responses
      
      ## Support
      For API support, contact: support@wayame.com
    `)
    .setVersion('1.0.0')
    .setContact('Wayame API Support', 'https://wayame.com', 'support@wayame.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000/', 'Development Server')
    .addServer('https://api-staging.wayame.com/', 'Staging Server')
    .addServer('https://api.wayame.com/', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'API health check endpoints')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile management')
    .addTag('Payments', 'Payment processing with Stripe and Paystack')
    .addTag('Transfers', 'Money transfer operations')
    .addTag('Banks', 'Bank account management')
    .addTag('Notifications', 'User notifications and alerts')
    .addTag('Admin', 'Administrative operations (Admin access required)')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Customize Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Wayame API Documentation',
    customfavIcon: 'https://wayame.com/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Wayame API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔧 Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();