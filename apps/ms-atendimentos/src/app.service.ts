import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): Record<string, any> {
    return {
      service: 'ms-atendimentos',
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      porta: process.env.PORT_ATENDIMENTOS || 3003
    };
  }
}