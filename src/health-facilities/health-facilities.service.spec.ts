import { Test, TestingModule } from '@nestjs/testing';
import { HealthFacilitiesService } from './health-facilities.service';

describe('HealthFacilitiesService', () => {
  let service: HealthFacilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthFacilitiesService],
    }).compile();

    service = module.get<HealthFacilitiesService>(HealthFacilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
