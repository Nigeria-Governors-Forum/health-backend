import { Test, TestingModule } from '@nestjs/testing';
import { HealthFinanceController } from './health-finance.controller';
import { HealthFinanceService } from './health-finance.service';

describe('HealthFinanceController', () => {
  let controller: HealthFinanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthFinanceController],
      providers: [HealthFinanceService],
    }).compile();

    controller = module.get<HealthFinanceController>(HealthFinanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
