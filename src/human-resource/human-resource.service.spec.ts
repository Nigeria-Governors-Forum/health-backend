import { Test, TestingModule } from '@nestjs/testing';
import { HumanResourceService } from './human-resource.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('HumanResourceService', () => {
  let service: HumanResourceService;
  const prismaMock = {
    hRH: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    demography: {
      findMany: jest.fn(),
    },
    health_Training_Institutions: {
      findMany: jest.fn(),
    },
    admission_Quota: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HumanResourceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<HumanResourceService>(HumanResourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns all zones and groups Nasarawa spelling variants together', async () => {
    prismaMock.hRH.findMany.mockResolvedValue([
      { state: 'Nassarawa', values: 5 },
    ]);
    prismaMock.demography.findMany.mockResolvedValue([
      { state: 'Nasarrawa', value: 100 },
    ]);
    prismaMock.health_Training_Institutions.findMany.mockResolvedValue([]);
    prismaMock.admission_Quota.findMany.mockResolvedValue([]);

    const result = await service.getZonalHumanResourceData('2024');

    expect(result.zones.map(({ zone }) => zone)).toEqual([
      'north central',
      'north east',
      'north west',
      'south east',
      'south south',
      'south west',
    ]);
    expect(result.zones[0].states.find(({ state }) => state === 'Nasarawa'))
      .toMatchObject({
      state: 'Nasarawa',
      total_hrh: 5,
      population: 100,
      hrh_density: 500,
    });
    expect(result.trend).toEqual([]);
  });

  it('sums training institutions for the requested year', async () => {
    prismaMock.hRH.findMany.mockResolvedValue([]);
    prismaMock.demography.findMany.mockResolvedValue([]);
    const trainingRecords = [
      {
        state: 'Borno',
        year: 2024,
        institution: 'College of Medicine',
        ownership: 'Private',
        value: 1,
      },
      {
        state: 'Borno',
        year: 2024,
        institution: 'College of Medicine',
        ownership: 'Public',
        value: 2,
      },
      {
        state: 'Borno',
        year: 2024,
        institution: 'Schools of Nursing & Midwifery',
        ownership: 'Public',
        value: 4,
      },
      {
        state: 'Borno',
        year: 2024,
        institution: 'Schools of Nursing & Midwifery',
        ownership: 'Private',
        value: 1,
      },
      {
        state: 'Borno',
        year: 2024,
        institution: 'Schools of Health Technology',
        ownership: 'Private',
        value: 3,
      },
      {
        state: 'Borno',
        year: 2024,
        institution: 'Schools of Health Technology',
        ownership: 'Public',
        value: 1,
      },
      {
        state: 'Borno',
        year: 2024,
        institution: 'Schools of Pharmacy',
        ownership: 'Private',
        value: 0,
      },
      {
        state: 'Borno',
        year: 2024,
        institution: 'Schools of Pharmacy',
        ownership: 'Public',
        value: 1,
      },
      {
        state: 'Borno',
        year: 2023,
        institution: 'Schools of Pharmacy',
        ownership: 'Public',
        value: 3,
      },
      {
        state: 'Adamawa',
        year: 2024,
        institution: 'Schools of Pharmacy',
        ownership: 'Public',
        value: 10,
      },
    ];
    prismaMock.health_Training_Institutions.findMany.mockImplementation(
      ({ where }) => {
        const year = where.year;
        const states = where.state.in;
        return Promise.resolve(
          trainingRecords.filter(
            (record) => {
              const matchesYear =
                typeof year === 'number'
                  ? record.year === year
                  : year !== null && typeof year === 'object';
              return matchesYear && states.includes(record.state);
            },
          ),
        );
      },
    );
    prismaMock.admission_Quota.findMany.mockResolvedValue([]);

    const result = await service.getZonalHumanResourceData('2024', 'Borno');
    const northEast = result.zones.find(
      ({ zone }) => zone === 'north east',
    );
    const borno = northEast?.states.find(({ state }) => state === 'Borno');

    expect(prismaMock.health_Training_Institutions.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          year: 2024,
        }),
      }),
    );
    expect(borno?.training_institutions).toBe(13);
    expect(borno?.health_training_institutions).toEqual({
      'College of Medicine': 3,
      'Schools of Nursing and Midwifery': 5,
      'Schools of Health Technology': 4,
      'Schools of Pharmacy': 1,
    });
    expect(northEast?.chart_data.find(({ state }) => state === 'Borno'))
      .toEqual({
        state: 'Borno',
        college_of_medicine: 3,
        nursing_midwifery: 5,
        health_technology: 4,
        pharmacy: 1,
      });
    expect(result.trend).toEqual([
      {
        state: 'Borno',
        year: 2023,
        total_hrh: 0,
        population: 0,
        training_institutions: 3,
        health_training_institutions: {
          'College of Medicine': 0,
          'Schools of Nursing and Midwifery': 0,
          'Schools of Health Technology': 0,
          'Schools of Pharmacy': 3,
        },
        admission_quota: 0,
        hrh_density: null,
      },
      {
        state: 'Borno',
        year: 2024,
        total_hrh: 0,
        population: 0,
        training_institutions: 13,
        health_training_institutions: {
          'College of Medicine': 3,
          'Schools of Nursing and Midwifery': 5,
          'Schools of Health Technology': 4,
          'Schools of Pharmacy': 1,
        },
        admission_quota: 0,
        hrh_density: null,
      },
    ]);
  });
});
