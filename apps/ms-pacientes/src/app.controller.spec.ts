import { Test, TestingModule } from '@nestjs/testing';
import { MsPacientesController } from './app.controller';
import { MsPacientesService } from './app.service';

describe('MsPacientesController', () => {
  let msPacientesController: MsPacientesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MsPacientesController],
      providers: [MsPacientesService],
    }).compile();

    msPacientesController = app.get<MsPacientesController>(MsPacientesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(msPacientesController.getHello()).toBe('Hello World!');
    });
  });
});
