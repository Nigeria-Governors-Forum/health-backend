import { Test, TestingModule } from '@nestjs/testing';
import { DemographyController } from './demography.controller';
import { DemographyService } from './demography.service';

describe('DemographyController', () => {
  let controller: DemographyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemographyController],
      providers: [DemographyService],
    }).compile();

    controller = module.get<DemographyController>(DemographyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
