# Deployment & Integration Guide

## Overview

This guide covers deployment strategies, integration patterns, and production considerations for the Wayame API.

## Deployment Options

### 1. Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY dist ./dist/

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/wayame
      - JWT_SECRET=your-production-jwt-secret
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: wayame
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 2. Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI and login
heroku create wayame-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set DATABASE_URL=your-database-url

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

#### AWS EC2 with PM2
```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'wayame-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ]
}
```

### 3. Kubernetes Deployment

**deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wayame-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wayame-api
  template:
    metadata:
      labels:
        app: wayame-api
    spec:
      containers:
      - name: api
        image: wayame/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: wayame-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: wayame-secrets
              key: jwt-secret
---
apiVersion: v1
kind: Service
metadata:
  name: wayame-api-service
spec:
  selector:
    app: wayame-api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Production Configuration

### Environment Variables
```env
# Production settings
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/wayame_prod

# Security
JWT_SECRET=your-super-secure-jwt-secret-256-bits-minimum
JWT_EXPIRES_IN=7d

# Payment Providers
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYSTACK_SECRET_KEY=sk_live_...

# Email Service
SENDGRID_API_KEY=SG.live...
FROM_EMAIL=noreply@yourdomain.com

# CORS & Security
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info

# Redis (for caching/sessions)
REDIS_URL=redis://localhost:6379
```

### Security Considerations

#### SSL/TLS Configuration
```javascript
// Enable HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

#### Rate Limiting
```javascript
// Enhanced rate limiting for production
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
}));
```

#### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### Database Configuration

#### Connection Pooling
```javascript
// Prisma production configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

// Connection pool settings
export const dbConfig = {
  connectionLimit: 10,
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 100,
};
```

## Integration Patterns

### 1. Webhook Integration

#### Stripe Webhooks
```javascript
// Webhook endpoint for Stripe
@Post('stripe/webhook')
@UseGuards(StripeWebhookGuard)
async handleStripeWebhook(@Body() payload: any, @Headers('stripe-signature') signature: string) {
  const event = this.stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await this.handlePaymentFailure(event.data.object);
      break;
  }

  return { received: true };
}
```

#### Paystack Webhooks
```javascript
@Post('paystack/webhook')
@UseGuards(PaystackWebhookGuard)
async handlePaystackWebhook(@Body() payload: any, @Headers('x-paystack-signature') signature: string) {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (hash === signature) {
    await this.processPaystackEvent(payload);
  }

  return { status: 'success' };
}
```

### 2. Third-party API Integration

#### Email Service Integration
```javascript
@Injectable()
export class EmailService {
  private sgMail = require('@sendgrid/mail');

  constructor() {
    this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendTransactionNotification(email: string, transaction: any) {
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      templateId: 'd-transaction-template-id',
      dynamicTemplateData: {
        amount: transaction.amount,
        currency: transaction.currency,
        date: transaction.createdAt
      }
    };

    await this.sgMail.send(msg);
  }
}
```

### 3. Frontend Integration

#### JavaScript/TypeScript Client
```typescript
class WayameAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setAuthToken(response.access_token);
    return response;
  }

  // User methods
  async getProfile() {
    return this.request('/users/profile');
  }

  // Payment methods
  async createPaymentIntent(amount: number, currency: string, recipientEmail: string) {
    return this.request('/payments/stripe/payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, recipientEmail }),
    });
  }

  // Transfer methods
  async createTransfer(recipientEmail: string, amount: number, currency: string, description: string) {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail, amount, currency, description }),
    });
  }
}

// Usage
const api = new WayameAPI('https://api.wayame.com');
await api.login('user@example.com', 'password');
const profile = await api.getProfile();
```

#### React Integration Example
```tsx
import React, { createContext, useContext, useReducer } from 'react';
import { WayameAPI } from './wayame-api';

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState & { login: (email: string, password: string) => Promise<void> }>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useReducer(
    (prev: AuthState, next: Partial<AuthState>) => ({ ...prev, ...next }),
    { user: null, token: null, loading: false }
  );

  const api = new WayameAPI(process.env.REACT_APP_API_URL!);

  const login = async (email: string, password: string) => {
    setState({ loading: true });
    try {
      const response = await api.login(email, password);
      setState({
        user: response.user,
        token: response.access_token,
        loading: false
      });
    } catch (error) {
      setState({ loading: false });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## Monitoring & Logging

### 1. Application Monitoring

#### Sentry Integration
```javascript
import * as Sentry from '@sentry/node';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());
```

#### Health Check Endpoint
```javascript
@Get('health')
async healthCheck() {
  const dbHealth = await this.prisma.$queryRaw`SELECT 1`;
  const redisHealth = await this.redis.ping();
  
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth ? 'healthy' : 'unhealthy',
      redis: redisHealth === 'PONG' ? 'healthy' : 'unhealthy'
    }
  };
}
```

### 2. Logging Configuration

#### Winston Logger
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'wayame-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## Performance Optimization

### 1. Caching Strategy

#### Redis Caching
```javascript
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get(key: string): Promise<any> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

### 2. Database Optimization

#### Query Optimization
```javascript
// Use proper indexing and query optimization
const transfers = await this.prisma.transfer.findMany({
  where: {
    userId: user.id,
    status: { in: ['PENDING', 'COMPLETED'] }
  },
  include: {
    sender: { select: { email: true, firstName: true, lastName: true } },
    recipient: { select: { email: true, firstName: true, lastName: true } }
  },
  orderBy: { createdAt: 'desc' },
  take: limit,
  skip: (page - 1) * limit
});
```

## Backup & Recovery

### Database Backup
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="wayame_prod"

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/wayame_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/wayame_backup_$DATE.sql"

# Remove backups older than 30 days
find $BACKUP_DIR -name "wayame_backup_*.sql.gz" -mtime +30 -delete
```

### Recovery Procedure
```bash
# Restore from backup
gunzip wayame_backup_YYYYMMDD_HHMMSS.sql.gz
psql $DATABASE_URL < wayame_backup_YYYYMMDD_HHMMSS.sql

# Run any necessary migrations
npx prisma migrate deploy
```

## Troubleshooting

### Common Production Issues

1. **High Memory Usage**
   - Check for memory leaks in Node.js
   - Monitor database connection pools
   - Review caching strategies

2. **Database Connection Issues**
   - Verify connection pool settings
   - Check database server status
   - Review network connectivity

3. **Payment Processing Errors**
   - Validate API keys and webhook endpoints
   - Check payment provider status pages
   - Review transaction logs

4. **Authentication Problems**
   - Verify JWT secret consistency
   - Check token expiration settings
   - Review CORS configuration

---

This deployment guide provides comprehensive instructions for production deployment and integration. For specific deployment questions, consult your infrastructure team or cloud provider documentation.