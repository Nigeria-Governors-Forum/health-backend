import { Test, TestingModule } from '@nestjs/testing';
import { ZonalHealthFinanceController } from './zonal-health-finance.controller';
import { ZonalHealthFinanceService } from './zonal-health-finance.service';

describe('ZonalHealthFinanceController', () => {
  let controller: ZonalHealthFinanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZonalHealthFinanceController],
      providers: [ZonalHealthFinanceService],
    }).compile();

    controller = module.get<ZonalHealthFinanceController>(ZonalHealthFinanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
