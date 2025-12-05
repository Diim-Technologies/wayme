# Wayame API Documentation

## Overview

Wayame is a comprehensive financial services API built with NestJS that provides secure payment processing, money transfers, and user management capabilities. The API integrates with multiple payment providers including Stripe and Paystack to offer seamless financial transactions.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Stripe account (for payment processing)
- Paystack account (for Nigerian payments)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see [Environment Variables](#environment-variables))
4. Run database migrations:
   ```bash
   npm run typeorm:migration:run
   ```
5. Seed Stripe payment methods:
   ```bash
   npm run migrate:stripe-payment-methods
   ```
6. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication except for public endpoints like health checks and registration.

### Authentication Flow

1. Register a new user or login with existing credentials
2. Receive JWT token in response
3. Include token in Authorization header for subsequent requests:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### User Roles

- **USER**: Standard user with access to personal operations
- **ADMIN**: Administrative user with elevated privileges

## API Endpoints

### Health Check

#### GET /
Check if the API is running.

**Response:**
```json
{
  "message": "Wayame API is running!",
  "timestamp": "2023-11-23T10:30:00.000Z"
}
```

---

### Authentication Endpoints

Base URL: `/auth`

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "country": "US",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": false,
    "createdAt": "2023-11-23T10:30:00.000Z"
  },
  "access_token": "jwt-token-here"
}
```

#### POST /auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "access_token": "jwt-token-here"
}
```

#### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password with OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

#### POST /auth/verify-email
Verify email with OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### POST /auth/resend-verification
Resend email verification OTP.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

### User Management

Base URL: `/users`
**Authentication Required**

#### GET /users/profile
Get current user's profile information.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "country": "US",
  "isEmailVerified": true,
  "isPhoneVerified": false,
  "createdAt": "2023-11-23T10:30:00.000Z"
}
```

#### PUT /users/profile
Update user profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890"
}
```

#### POST /users/change-password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newPassword123"
}
```

#### DELETE /users/profile
Delete user account.

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

---

### Payment Processing

Base URL: `/payments`
**Authentication Required**

#### POST /payments/create-intent
Create a Stripe payment intent for a transfer.

**Request Body:**
```json
{
  "transferReference": "WMT-1733403411000-ABC123"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 1055,
  "currency": "ngn",
  "transferReference": "WMT-1733403411000-ABC123"
}
```

#### GET /payments/methods
Get all available Stripe payment methods.

**Response:**
```json
[
  {
    "id": "uuid",
    "stripeType": "card",
    "displayName": "Credit/Debit Card",
    "category": "CARD",
    "description": "Accept major credit and debit cards",
    "supportedCountries": ["GLOBAL"],
    "supportedCurrencies": ["ALL"],
    "isActive": true
  },
  {
    "id": "uuid",
    "stripeType": "apple_pay",
    "displayName": "Apple Pay",
    "category": "WALLET",
    "description": "Fast and secure payments with Apple Pay",
    "supportedCountries": ["GLOBAL"],
    "supportedCurrencies": ["ALL"],
    "isActive": true
  }
]
```

#### POST /payments/webhook
Stripe webhook handler for payment events.

**Note:** This endpoint is called by Stripe and requires webhook signature verification.

---

### Money Transfers

Base URL: `/transfers`

#### POST /transfers/quote
Get a transfer quote with exchange rates and fees.

**Authentication:** Not required (Public endpoint)

**Request Body:**
```json
{
  "amount": 1000,
  "fromCurrency": "NGN",
  "toCurrency": "USD"
}
```

**Response:**
```json
{
  "amount": 1000,
  "fromCurrency": "NGN",
  "toCurrency": "USD",
  "exchangeRate": 0.0012,
  "convertedAmount": 1.2,
  "transferFee": 50,
  "conversionFee": 5,
  "totalFee": 55,
  "totalAmount": 1055,
  "expiresAt": "2025-12-05T13:15:00.000Z"
}
```

#### POST /transfers/proceed
Create a new transfer and generate reference ID.

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 1000,
  "fromCurrency": "NGN",
  "toCurrency": "USD",
  "recipientName": "John Doe",
  "recipientBankId": "uuid",
  "recipientAccount": "1234567890",
  "recipientPhone": "+2348012345678",
  "purpose": "Family support",
  "notes": "Monthly allowance"
}
```

**Response:**
```json
{
  "referenceId": "WMT-1733403411000-ABC123",
  "amount": 1000,
  "fromCurrency": "NGN",
  "toCurrency": "USD",
  "exchangeRate": 0.0012,
  "transferFee": 50,
  "conversionFee": 5,
  "totalFee": 55,
  "totalAmount": 1055,
  "status": "PENDING"
}
```

#### GET /transfers/:reference
Get transfer details by reference ID.

**Parameters:**
- `reference`: Transfer reference (e.g., WMT-1733403411000-ABC123)

**Response:**
```json
{
  "id": "uuid",
  "reference": "WMT-1733403411000-ABC123",
  "amount": 1000,
  "fee": 55,
  "exchangeRate": 0.0012,
  "sourceCurrency": "NGN",
  "targetCurrency": "USD",
  "status": "PENDING",
  "recipientName": "John Doe",
  "recipientAccount": "1234567890",
  "recipientPhone": "+2348012345678",
  "purpose": "Family support",
  "createdAt": "2025-12-05T12:00:00.000Z"
}
```

#### GET /transfers
Get user's transfer history with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "reference": "WMT-1733403411000-ABC123",
      "amount": 1000,
      "fee": 55,
      "sourceCurrency": "NGN",
      "targetCurrency": "USD",
      "status": "COMPLETED",
      "recipientName": "John Doe",
      "createdAt": "2025-12-05T12:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

#### PATCH /transfers/:id/approve
Approve a transfer (Admin only).

**Request Body:**
```json
{
  "notes": "Transfer approved"
}
```

**Response:**
```json
{
  "id": "uuid",
  "reference": "WMT-1733403411000-ABC123",
  "status": "COMPLETED",
  "processedAt": "2025-12-05T13:00:00.000Z",
  "completedAt": "2025-12-05T13:00:00.000Z"
}
```

---

### Bank Management

Base URL: `/banks`
**Authentication Required**

#### GET /banks
Get list of supported banks.

**Response:**
```json
{
  "banks": [
    {
      "id": "uuid",
      "name": "Chase Bank",
      "code": "CHASE",
      "country": "US"
    }
  ]
}
```

#### POST /banks/account
Add bank account for user.

**Request Body:**
```json
{
  "bankId": "uuid",
  "accountNumber": "1234567890",
  "accountName": "John Doe"
}
```

#### GET /banks/account
Get user's bank accounts.

#### DELETE /banks/account/:id
Remove bank account.

---

### Notifications

Base URL: `/notifications`
**Authentication Required**

#### GET /notifications
Get user notifications.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `read` (optional): Filter by read status

#### PUT /notifications/:id/read
Mark notification as read.

#### PUT /notifications/mark-all-read
Mark all notifications as read.

---

### Admin Endpoints

Base URL: `/admin`
**Admin Authentication Required**

#### GET /admin/users
Get all users (admin only).

#### GET /admin/transfers
Get all transfers (admin only).

#### GET /admin/payments
Get all payments (admin only).

#### PUT /admin/users/:id/status
Update user status (admin only).

#### GET /admin/analytics
Get system analytics (admin only).

#### POST /admin/fee-config
Configure transaction fees (admin only).

**Request Body:**
```json
{
  "transferFeePercentage": 2.5,
  "paymentFeePercentage": 3.0,
  "minimumFee": 1.00
}
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "Bad Request",
  "timestamp": "2023-11-23T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **100 requests per minute** per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wayame"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Paystack
PAYSTACK_SECRET_KEY="sk_test_..."

# Email (SendGrid)
SENDGRID_API_KEY="SG...."
FROM_EMAIL="noreply@wayame.com"

# App
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## Database Schema

The application uses TypeORM with PostgreSQL. Key entities include:

- **User**: User accounts and authentication
- **UserProfile**: Extended user profile information
- **Transfer**: Money transfer records with exchange rates
- **Transaction**: Payment transaction tracking
- **PaymentMethod**: User payment methods
- **StripePaymentMethod**: Available Stripe payment methods catalog
- **Bank**: Supported banks
- **Beneficiary**: Saved beneficiary information
- **Currency**: Supported currencies
- **ExchangeRate**: Currency exchange rates
- **Fee**: Fee configuration for transfers and conversions
- **Notification**: User notifications
- **OTP**: One-time passwords for verification

For detailed schema, see entity files in `src/entities/`

### Database Migrations

Run migrations using TypeORM:
```bash
# Run migrations
npm run typeorm:migration:run

# Generate new migration
npm run typeorm:migration:generate -- src/migrations/MigrationName

# Revert last migration
npm run typeorm:migration:revert
```

### Seeding Data

Seed Stripe payment methods:
```bash
npm run migrate:stripe-payment-methods
```

Verify seeded data:
```bash
npm run verify:stripe-payment-methods
```

For detailed schema, see entity files in `src/entities/`

## Development

### Running Tests
```bash
npm run test
npm run test:e2e
npm run test:cov
```

### Building for Production
```bash
npm run build
npm run start:prod
```

### Database Operations
```bash
# Run migrations
npm run typeorm:migration:run

# Generate new migration
npm run typeorm:migration:generate -- src/migrations/MigrationName

# Revert last migration
npm run typeorm:migration:revert

# Seed Stripe payment methods
npm run migrate:stripe-payment-methods
```

## Support

For API support and questions, please contact the development team or create an issue in the project repository.

---

**Version:** 2.0.0  
**Last Updated:** December 5, 2025
