import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { PartnersMappingService } from './partners-mapping.service';

describe('PartnersMappingService', () => {
  let service: PartnersMappingService;
  const prismaMock = {
    partners_Mapping: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersMappingService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PartnersMappingService>(PartnersMappingService);
  });

  it('returns partner mappings for the requested state and year', async () => {
    const rows = [
      {
        state: 'Lagos',
        year: 2024,
        partner: 'Partner A',
        intervention_area: 'Immunization',
        coverage_area: '5',
      },
    ];
    prismaMock.partners_Mapping.findMany.mockResolvedValue(rows);

    const result = await service.getPartnersMappingData('Lagos', '2024');

    expect(prismaMock.partners_Mapping.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          state: { equals: 'Lagos', mode: 'insensitive' },
          year: 2024,
        },
      }),
    );
    expect(result.data).toEqual({ state: 'Lagos', year: 2024, partners: rows });
  });

  it('returns zonal mappings and historical records for the selected state', async () => {
    const currentRows = [
      {
        zone: 'South West',
        state: 'Lagos',
        year: 2024,
        partner: 'Partner A',
        intervention_area: 'Immunization',
        coverage_area: '5',
      },
      {
        zone: 'South West',
        state: 'Oyo',
        year: 2024,
        partner: 'Partner B',
        intervention_area: 'Primary care',
        coverage_area: '3',
      },
    ];
    const trendRows = [
      { ...currentRows[0], year: 2022, coverage_area: '2' },
      currentRows[0],
    ];
    prismaMock.partners_Mapping.findMany
      .mockResolvedValueOnce(currentRows)
      .mockResolvedValueOnce(trendRows);

    const result = await service.getZonalPartnersMappingData(
      'south-west',
      '2024',
      'Lagos',
    );

    expect(result.data.zoneWithin).toEqual(currentRows);
    expect(result.data.allStates).toEqual(currentRows);
    expect(result.data.trend).toEqual([
      {
        year: 2022,
        partner: 'Partner A',
        intervention_area: 'Immunization',
        coverage_area: '2',
      },
      {
        year: 2024,
        partner: 'Partner A',
        intervention_area: 'Immunization',
        coverage_area: '5',
      },
    ]);
  });
});
