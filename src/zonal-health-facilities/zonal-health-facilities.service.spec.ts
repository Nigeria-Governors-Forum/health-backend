import { Test, TestingModule } from '@nestjs/testing';
import { ZonalHealthFacilitiesService } from './zonal-health-facilities.service';

describe('ZonalHealthFacilitiesService', () => {
  let service: ZonalHealthFacilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZonalHealthFacilitiesService],
    }).compile();

    service = module.get<ZonalHealthFacilitiesService>(ZonalHealthFacilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
