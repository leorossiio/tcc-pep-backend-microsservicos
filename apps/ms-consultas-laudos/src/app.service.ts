import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): Record<string, any> {
    return {
      service: 'ms-consultas-laudos',
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      porta: process.env.PORT_CONSULTAS_LAUDOS || 3005,
    };
  }
}