import { Controller, Get } from '@nestjs/common';
import { MsPacientesService } from './app.service';

@Controller()
export class MsPacientesController {
  constructor(private readonly msPacientesService: MsPacientesService) {}

  @Get()
  getHello(): string {
    return this.msPacientesService.getHello();
  }
}
