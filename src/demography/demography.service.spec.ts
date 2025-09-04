import { Test, TestingModule } from '@nestjs/testing';
import { DemographyService } from './demography.service';

describe('DemographyService', () => {
  let service: DemographyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemographyService],
    }).compile();

    service = module.get<DemographyService>(DemographyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
