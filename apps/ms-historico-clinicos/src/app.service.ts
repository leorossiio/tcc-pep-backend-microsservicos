import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): Record<string, any> {
    return {
      service: 'ms-historico-clinicos',
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      porta: process.env.PORT_HISTORICO_CLINICOS || 3006,
    };
  }
}