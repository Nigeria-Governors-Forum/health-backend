import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { HealthOutcomesService } from './health-outcomes.service';

describe('HealthOutcomesService', () => {
  let service: HealthOutcomesService;
  const prismaMock = {
    health_Outcomes: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthOutcomesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<HealthOutcomesService>(HealthOutcomesService);
  });

  it('returns outcome records for the selected state and year', async () => {
    const outcomes = [
      {
        state: 'Lagos',
        calendar_year: 2024,
        indicator: 'Maternal mortality',
        source: 'Survey',
        value: 12,
        target: 10,
      },
    ];
    prismaMock.health_Outcomes.findMany.mockResolvedValue(outcomes);

    const result = await service.getHealthOutcomesData('Lagos', '2024');

    expect(prismaMock.health_Outcomes.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          state: { equals: 'Lagos', mode: 'insensitive' },
          calendar_year: 2024,
        },
      }),
    );
    expect(result.data).toEqual({ state: 'Lagos', year: 2024, outcomes });
  });

  it('returns zone outcomes and a state trend, optionally filtered by indicator', async () => {
    const lagosOutcome = {
      zone: 'South West',
      state: 'Lagos',
      calendar_year: 2024,
      indicator: 'Maternal mortality',
      source: 'Survey',
      value: 12,
      target: 10,
    };
    const oyoOutcome = { ...lagosOutcome, state: 'Oyo', value: 8 };
    const trendRows = [
      { ...lagosOutcome, calendar_year: 2022, value: 14 },
      lagosOutcome,
    ];
    prismaMock.health_Outcomes.findMany
      .mockResolvedValueOnce([lagosOutcome, oyoOutcome])
      .mockResolvedValueOnce(trendRows);

    const result = await service.getZonalHealthOutcomesData(
      'south-west',
      'Lagos',
      '2024',
      'Maternal mortality',
    );

    expect(prismaMock.health_Outcomes.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          calendar_year: 2024,
          indicator: {
            equals: 'Maternal mortality',
            mode: 'insensitive',
          },
        }),
      }),
    );
    expect(prismaMock.health_Outcomes.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          state: { equals: 'Lagos', mode: 'insensitive' },
          indicator: {
            equals: 'Maternal mortality',
            mode: 'insensitive',
          },
        }),
      }),
    );
    expect(result.data.zoneWithin).toEqual([lagosOutcome, oyoOutcome]);
    expect(result.data.allStates).toHaveLength(2);
    expect(result.data.trend).toEqual([
      {
        year: 2022,
        indicator: 'Maternal mortality',
        source: 'Survey',
        value: 14,
        target: 10,
      },
      {
        year: 2024,
        indicator: 'Maternal mortality',
        source: 'Survey',
        value: 12,
        target: 10,
      },
    ]);
  });
});
