# API Testing Guide

## Overview

This guide provides instructions for testing the Wayame API using the included Postman collection and other testing tools.

## Postman Collection

The repository includes a comprehensive Postman collection (`Wayame_API_Collection.postman_collection.json`) with pre-configured requests for all API endpoints.

### Setup

1. **Import Collection**
   - Open Postman
   - Click "Import" button
   - Select `Wayame_API_Collection.postman_collection.json`
   - Click "Import"

2. **Configure Environment Variables**
   Create a new environment in Postman with the following variables:
   ```
   baseUrl: http://localhost:3000
   authToken: (will be set automatically after login)
   userId: (will be set automatically after login)
   ```

### Authentication Flow

The collection is organized to follow a logical testing flow:

1. **Health Check** - Verify API is running
2. **User Registration** - Create new user account
3. **Email Verification** - Verify email with OTP
4. **User Login** - Authenticate and receive token
5. **Profile Management** - Update user information
6. **Payment Operations** - Test payment processing
7. **Transfer Operations** - Test money transfers
8. **Admin Operations** - Test administrative functions

### Pre-request Scripts

The collection includes pre-request scripts that automatically:
- Set authentication tokens from login responses
- Generate test data for requests
- Handle environment variable management

### Test Scripts

Post-response test scripts validate:
- Response status codes
- Response body structure
- Data consistency
- Error handling

## Manual Testing

### 1. Authentication Testing

**Register New User:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "country": "US",
    "dateOfBirth": "1990-01-01"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 2. Protected Endpoint Testing

**Get User Profile:**
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Payment Testing

**Create Stripe Payment Intent:**
```bash
curl -X POST http://localhost:3000/payments/stripe/payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 1000,
    "currency": "usd",
    "recipientEmail": "recipient@example.com"
  }'
```

## Testing Scenarios

### User Registration Flow
1. Register new user with valid data
2. Verify email verification OTP is sent
3. Complete email verification
4. Login with verified account
5. Access protected endpoints

### Payment Processing Flow
1. Create payment intent
2. Simulate successful payment
3. Verify payment confirmation
4. Check payment status
5. Test payment failure scenarios

### Transfer Flow
1. Create money transfer
2. Verify recipient notification
3. Check transfer status
4. Test cancellation (if applicable)
5. View transfer history

### Admin Operations
1. Login with admin credentials
2. View system analytics
3. Manage user accounts
4. Configure fee settings
5. Monitor transactions

## Error Testing

### Authentication Errors
- Invalid credentials
- Expired tokens
- Missing authorization headers
- Invalid token formats

### Validation Errors
- Missing required fields
- Invalid email formats
- Weak passwords
- Invalid amounts
- Unsupported currencies

### Business Logic Errors
- Insufficient funds
- Invalid recipients
- Duplicate transactions
- Rate limiting

## Load Testing

For performance testing, consider using tools like:

### Artillery.io
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Health Check"
    requests:
      - get:
          url: "/"
```

### k6
```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const response = http.get('http://localhost:3000/');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
```

## Test Data Management

### Development Database
Use the following test accounts for development:

**Regular User:**
- Email: `user@test.com`
- Password: `Test123!`

**Admin User:**
- Email: `admin@test.com`
- Password: `Admin123!`

### Test Payment Cards (Stripe)

**Successful Payments:**
- `4242424242424242` (Visa)
- `5555555555554444` (Mastercard)

**Failed Payments:**
- `4000000000000002` (Card declined)
- `4000000000009995` (Insufficient funds)

### Test Bank Accounts (Paystack)
- Test account numbers provided by Paystack documentation

## Automated Testing

The project includes automated tests that can be run with:

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Security Testing

### Authentication Security
- Test JWT token expiration
- Verify role-based access control
- Test for authentication bypass
- Validate password security requirements

### Input Validation
- SQL injection attempts
- XSS payload testing
- File upload validation
- Rate limiting effectiveness

## Troubleshooting

### Common Issues

**Connection Refused:**
- Verify API server is running
- Check port configuration
- Confirm database connectivity

**Authentication Failures:**
- Verify JWT token validity
- Check token format in headers
- Confirm user account status

**Payment Errors:**
- Validate API keys
- Check webhook configurations
- Verify test vs. live mode settings

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Data Cleanup**: Reset test data between runs
3. **Environment Separation**: Use different databases for testing
4. **Security**: Never use production keys in tests
5. **Documentation**: Keep test cases documented and updated

---

For additional testing support, refer to the main API documentation or contact the development team.