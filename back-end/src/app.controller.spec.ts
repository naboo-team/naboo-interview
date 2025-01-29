import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

// no other routes are delared in "app.controller.ts"
// all specific domain queries are tested in the "app.e2e.spec.ts" file
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should respond to health check', () => {
      expect(appController.getHealthCheck()).toBe('Server is running!');
    });
  });
});
