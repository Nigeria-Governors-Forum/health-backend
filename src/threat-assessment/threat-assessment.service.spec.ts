import { Test, TestingModule } from '@nestjs/testing';
import { ThreatAssessmentService } from './threat-assessment.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ThreatAssessmentService', () => {
  let service: ThreatAssessmentService;
  const prismaMock = {
    threat_Vulnerability_Assessment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    threat_Vulnerability_LGA: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreatAssessmentService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ThreatAssessmentService>(ThreatAssessmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all states from fallback data when DB has no rows', async () => {
      prismaMock.threat_Vulnerability_Assessment.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result.total_states).toBe(37);
      expect(result.summary.total_states).toBe(37);
      expect(result.summary.risk_breakdown.CRITICAL).toBe(4); // Niger, Borno, Zamfara, Katsina
      expect(result.data.find((s) => s.state === 'Niger')).toBeDefined();
      expect(result.data.find((s) => s.state === 'Lagos')).toBeDefined();
    });

    it('returns rows from DB when available', async () => {
      const dbRows = [
        {
          id: 1,
          zone: 'North-Central',
          state: 'Niger',
          year: 2026,
          risk: 'CRITICAL',
          primary_threats: 'Threat of renewed banditry',
          hotspots_lga: 'Shiroro, Rafi, Mariga',
        },
      ];
      prismaMock.threat_Vulnerability_Assessment.findMany.mockResolvedValue(dbRows);

      const result = await service.findAll();

      expect(result.total_states).toBe(1);
      expect(result.data[0].state).toBe('Niger');
      expect(result.data[0].lgas.map((l: any) => l.lga)).toEqual(['Shiroro', 'Rafi', 'Mariga']);
      expect(result.data[0].lgas[0].threat_level).toBe('CRITICAL');
    });

    it('filters by zone properly', async () => {
      prismaMock.threat_Vulnerability_Assessment.findMany.mockResolvedValue([]);

      const result = await service.findAll({ zone: 'North-Central' });

      expect(result.data.every((s) => s.zone === 'North-Central')).toBe(true);
      expect(result.total_states).toBe(7);
    });

    it('filters by risk properly', async () => {
      prismaMock.threat_Vulnerability_Assessment.findMany.mockResolvedValue([]);

      const result = await service.findAll({ risk: 'CRITICAL' });

      expect(result.data.every((s) => s.risk === 'CRITICAL')).toBe(true);
      expect(result.total_states).toBe(4);
    });
  });

  describe('findByState', () => {
    it('returns state and associated LGAs from fallback when not in DB', async () => {
      prismaMock.threat_Vulnerability_Assessment.findFirst.mockResolvedValue(null);

      const result = await service.findByState('Niger');

      expect(result.data.state).toBe('Niger');
      expect(result.data.risk).toBe('CRITICAL');
      expect(result.data.lgas.length).toBeGreaterThan(0);
      expect(result.data.lgas.map((l: any) => l.lga)).toContain('Shiroro');
    });

    it('returns state and associated LGAs from DB when available', async () => {
      const stateRow = {
        id: 10,
        zone: 'North-Central',
        state: 'Niger',
        year: 2026,
        risk: 'CRITICAL',
        primary_threats: 'Banditry',
        hotspots_lga: 'Shiroro, Rafi',
      };
      const lgaRows = [
        {
          id: 101,
          zone: 'North-Central',
          state: 'Niger',
          year: 2026,
          lga: 'Shiroro',
          risk: 'CRITICAL',
          primary_threats: 'Banditry',
        },
        {
          id: 102,
          zone: 'North-Central',
          state: 'Niger',
          year: 2026,
          lga: 'Rafi',
          risk: 'CRITICAL',
          primary_threats: 'Banditry',
        },
      ];
      prismaMock.threat_Vulnerability_Assessment.findFirst.mockResolvedValue(stateRow);
      prismaMock.threat_Vulnerability_LGA.findMany.mockResolvedValue(lgaRows);

      const result = await service.findByState('Niger');

      expect(result.data.state).toBe('Niger');
      expect(result.data.total_hotspots).toBe(2);
      expect(result.data.lgas.map((l: any) => l.lga)).toEqual(['Shiroro', 'Rafi']);
      expect(result.data.lgas[0].threat_level).toBe('CRITICAL');
      expect(result.data.lgas[0].is_hotspot).toBe(true);
    });
  });

  describe('findAllLgas and findByLga', () => {
    it('returns all LGA records', async () => {
      prismaMock.threat_Vulnerability_LGA.findMany.mockResolvedValue([]);

      const result = await service.findAllLgas();

      expect(result.total_lgas).toBeGreaterThan(50);
      expect(result.data.find((l: any) => l.lga === 'Shiroro')).toBeDefined();
    });

    it('finds a specific LGA with its threat details', async () => {
      prismaMock.threat_Vulnerability_LGA.findFirst.mockResolvedValue(null);

      const result = await service.findByLga('Shiroro');

      expect(result.data.lga).toBe('Shiroro');
      expect(result.data.state).toBe('Niger');
      expect(result.data.risk).toBe('CRITICAL');
    });
  });
});

