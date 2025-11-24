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
   npx prisma migrate dev
   ```
5. Seed the database:
   ```bash
   npx prisma db seed
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

#### POST /payments/stripe/payment-intent
Create a Stripe payment intent.

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "usd",
  "recipientEmail": "recipient@example.com"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

#### POST /payments/stripe/confirm
Confirm a Stripe payment.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

#### POST /payments/paystack/initialize
Initialize Paystack payment.

**Request Body:**
```json
{
  "amount": 10000,
  "email": "user@example.com",
  "currency": "NGN"
}
```

#### POST /payments/paystack/verify/:reference
Verify Paystack payment.

**Parameters:**
- `reference`: Payment reference from Paystack

---

### Money Transfers

Base URL: `/transfers`
**Authentication Required**

#### POST /transfers
Create a new money transfer.

**Request Body:**
```json
{
  "recipientEmail": "recipient@example.com",
  "amount": 100.00,
  "currency": "USD",
  "description": "Payment for services"
}
```

#### GET /transfers
Get user's transfer history.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `status` (optional): Filter by transfer status

**Response:**
```json
{
  "transfers": [
    {
      "id": "uuid",
      "amount": 100.00,
      "currency": "USD",
      "status": "COMPLETED",
      "recipientEmail": "recipient@example.com",
      "createdAt": "2023-11-23T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /transfers/:id
Get specific transfer details.

#### PUT /transfers/:id/cancel
Cancel a pending transfer.

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

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: User accounts and profiles
- **Transfer**: Money transfer records
- **Payment**: Payment transaction records
- **BankAccount**: User bank account information
- **Notification**: User notifications
- **OTP**: One-time passwords for verification
- **FeeConfiguration**: System fee settings

For detailed schema, see `prisma/schema.prisma`

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
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## Support

For API support and questions, please contact the development team or create an issue in the project repository.

---

**Version:** 1.0.0  
**Last Updated:** November 23, 2025# wayme
# wayme
