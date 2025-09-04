import { Test, TestingModule } from '@nestjs/testing';
import { HealthFinanceService } from './health-finance.service';

describe('HealthFinanceService', () => {
  let service: HealthFinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthFinanceService],
    }).compile();

    service = module.get<HealthFinanceService>(HealthFinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
