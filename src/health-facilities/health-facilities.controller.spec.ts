import { Test, TestingModule } from '@nestjs/testing';
import { HealthFacilitiesController } from './health-facilities.controller';
import { HealthFacilitiesService } from './health-facilities.service';

describe('HealthFacilitiesController', () => {
  let controller: HealthFacilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthFacilitiesController],
      providers: [HealthFacilitiesService],
    }).compile();

    controller = module.get<HealthFacilitiesController>(HealthFacilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
