import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Wayame API - Nigerian Money Transfer Service 🇳🇬';
  }

  getHealth() {
    return {
      status: 'OK',
      message: 'Wayame API is running successfully',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}