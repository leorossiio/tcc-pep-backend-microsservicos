import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): Record<string, any> {
    return {
      service: 'ms-medicos',
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      porta: process.env.PORT_MEDICOS || 3001
    };
  }
}