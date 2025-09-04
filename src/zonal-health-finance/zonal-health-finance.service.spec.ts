import { Test, TestingModule } from '@nestjs/testing';
import { ZonalHealthFinanceService } from './zonal-health-finance.service';

describe('ZonalHealthFinanceService', () => {
  let service: ZonalHealthFinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZonalHealthFinanceService],
    }).compile();

    service = module.get<ZonalHealthFinanceService>(ZonalHealthFinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
