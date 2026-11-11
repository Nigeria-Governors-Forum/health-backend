import { Test, TestingModule } from '@nestjs/testing';
import { HealthOutcomesController } from './health-outcomes.controller';
import { HealthOutcomesService } from './health-outcomes.service';

describe('HealthOutcomesController', () => {
  let controller: HealthOutcomesController;
  const serviceMock = {
    getHealthOutcomesData: jest.fn(),
    getZonalHealthOutcomesData: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthOutcomesController],
      providers: [{ provide: HealthOutcomesService, useValue: serviceMock }],
    }).compile();

    controller = module.get<HealthOutcomesController>(HealthOutcomesController);
  });

  it('passes state and year to the state outcomes service', () => {
    controller.getHealthOutcomesData('Lagos', '2024');

    expect(serviceMock.getHealthOutcomesData).toHaveBeenCalledWith(
      'Lagos',
      '2024',
    );
  });

  it('passes zone, state, year, and indicator to the zonal service', () => {
    controller.getZonalHealthOutcomesData(
      'south-west',
      'Lagos',
      '2024',
      'Maternal mortality',
    );

    expect(serviceMock.getZonalHealthOutcomesData).toHaveBeenCalledWith(
      'south-west',
      'Lagos',
      '2024',
      'Maternal mortality',
    );
  });
});
