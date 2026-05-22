import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): Record<string, any> {
    return {
      service: 'ms-auditoria',
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      porta: process.env.PORT_AUDITORIA || 3004
    };
  }
}