import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Root health check', 
    description: 'Simple endpoint to verify the API is running and accessible' 
  })
  @ApiOkResponse({
    description: 'API is running successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Wayame API is running!' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Detailed health check', 
    description: 'Comprehensive health check that verifies database connectivity and service status' 
  })
  @ApiOkResponse({
    description: 'Detailed health status of all services',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'connected' },
            api: { type: 'string', example: 'running' },
          },
        },
        uptime: { type: 'number', example: 3600.5 },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}