import { Test, TestingModule } from '@nestjs/testing';
import { ZonalHealthFacilitiesController } from './zonal-health-facilities.controller';
import { ZonalHealthFacilitiesService } from './zonal-health-facilities.service';

describe('ZonalHealthFacilitiesController', () => {
  let controller: ZonalHealthFacilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZonalHealthFacilitiesController],
      providers: [ZonalHealthFacilitiesService],
    }).compile();

    controller = module.get<ZonalHealthFacilitiesController>(ZonalHealthFacilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
