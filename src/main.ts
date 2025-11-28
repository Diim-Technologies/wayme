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
      Wayame  financial services API 
    `)
    .setVersion('1.0.0')
    .addServer('http://localhost:3000/', 'Development Server')
    .addServer('https://backendapi1-production.up.railway.app', 'Production Server')
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

    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile management')
    .addTag('Payments', 'Payment processing with Stripe and Paystack')
    .addTag('Transfers', 'Money transfer operations')
    .addTag('Banks', 'Bank account management')
    .addTag('Beneficiaries', 'Saved beneficiary management')
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