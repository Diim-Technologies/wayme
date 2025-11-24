"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
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
        .setContact('Wayame Support', 'https://wayame.com/support', 'support@wayame.com')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
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
//# sourceMappingURL=main.js.map