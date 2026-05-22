import { Injectable } from '@nestjs/common';

@Injectable()
export class MsAuditoriaService {
  getHello(): string {
    return 'Hello World!';
  }
}
