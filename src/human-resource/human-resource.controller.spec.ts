import { Test, TestingModule } from '@nestjs/testing';
import { HumanResourceController } from './human-resource.controller';
import { HumanResourceService } from './human-resource.service';

describe('HumanResourceController', () => {
  let controller: HumanResourceController;
  const humanResourceServiceMock = {
    getZonalHumanResourceData: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HumanResourceController],
      providers: [
        { provide: HumanResourceService, useValue: humanResourceServiceMock },
      ],
    }).compile();

    controller = module.get<HumanResourceController>(HumanResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the selected state to the zonal trend service', () => {
    controller.getZonalHumanResourceData('2024', 'Borno');

    expect(
      humanResourceServiceMock.getZonalHumanResourceData,
    ).toHaveBeenCalledWith('2024', 'Borno');
  });
});
