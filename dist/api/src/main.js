"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const compression = require("compression");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
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
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Health', 'API health check endpoints')
        .addTag('Authentication', 'User authentication and authorization')
        .addTag('Users', 'User profile management')
        .addTag('Payments', 'Payment processing with Stripe and Paystack')
        .addTag('Transfers', 'Money transfer operations')
        .addTag('Banks', 'Bank account management')
        .addTag('Notifications', 'User notifications and alerts')
        .addTag('Admin', 'Administrative operations (Admin access required)')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey, methodKey) => methodKey,
    });
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
//# sourceMappingURL=main.js.map