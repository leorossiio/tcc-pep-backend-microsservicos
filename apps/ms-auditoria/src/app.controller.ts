import { Controller, Get } from '@nestjs/common';
import { MsAuditoriaService } from './app.service';

@Controller()
export class MsAuditoriaController {
  constructor(private readonly msAuditoriaService: MsAuditoriaService) {}

  @Get()
  getHello(): string {
    return this.msAuditoriaService.getHello();
  }
}
