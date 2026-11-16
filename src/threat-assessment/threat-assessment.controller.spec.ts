import { Test, TestingModule } from '@nestjs/testing';
import { ThreatAssessmentController } from './threat-assessment.controller';
import { ThreatAssessmentService } from './threat-assessment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import * as XLSX from 'xlsx';

describe('ThreatAssessmentController', () => {
  let controller: ThreatAssessmentController;
  let service: ThreatAssessmentService;
  const userServiceMock = {
    uploadFromWorkbook: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    userServiceMock.uploadFromWorkbook.mockResolvedValue({
      message: 'Upload completed successfully',
      sheetReports: [
        {
          sheetName: 'Threat_Vulnerability_Assessment',
          canonicalKey: 'Threat_Vulnerability_Assessment',
          status: 'SUCCESS',
          totalRows: 1,
          createdRows: 1,
          updatedRows: 0,
          skippedRows: 0,
          issues: [],
        },
      ],
    });
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThreatAssessmentController],
      providers: [
        ThreatAssessmentService,
        { provide: UserService, useValue: userServiceMock },
        {
          provide: PrismaService,
          useValue: {
            threat_Vulnerability_Assessment: {
              findMany: jest.fn().mockResolvedValue([]),
              findFirst: jest.fn().mockResolvedValue(null),
            },
            threat_Vulnerability_LGA: {
              findMany: jest.fn().mockResolvedValue([]),
              findFirst: jest.fn().mockResolvedValue(null),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<ThreatAssessmentController>(
      ThreatAssessmentController,
    );
    service = module.get<ThreatAssessmentService>(ThreatAssessmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll returns dataset', async () => {
    const res = await controller.findAll();
    expect(res.total_states).toBe(37);
  });

  it('findByState returns state data with LGAs', async () => {
    const res = await controller.findByState('Benue');
    expect(res.data.state).toBe('Benue');
    expect(res.data.risk).toBe('HIGH');
  });

  it('findByLga returns LGA threat info', async () => {
    const res = await controller.findByLga('Maiduguri');
    expect(res.data.lga).toBe('Maiduguri');
    expect(res.data.state).toBe('Borno');
    expect(res.data.risk).toBe('CRITICAL');
  });

  it('imports only the security worksheet and uses the selected year', async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ['state', 'zone', 'risk', 'primary_threats', 'hotspots_lga'],
        ['Benue', 'North-Central', 'HIGH', 'Communal violence', 'Guma'],
      ]),
      'Threat_Vulnerability_Assessment',
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([['state', 'year']]),
      'Demography',
    );

    const result = await controller.uploadWorkbook(2025, {
      originalname: 'security.xlsx',
      buffer: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
    } as Express.Multer.File);

    expect(result.year).toBe(2025);
    expect(userServiceMock.uploadFromWorkbook).toHaveBeenCalledWith(
      expect.objectContaining({
        SheetNames: ['Threat_Vulnerability_Assessment'],
      }),
      2025,
    );
  });

  it('rejects workbooks without a threat assessment worksheet', async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([['state', 'year']]),
      'Demography',
    );

    await expect(
      controller.uploadWorkbook(2025, {
        originalname: 'health.xlsx',
        buffer: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
      } as Express.Multer.File),
    ).rejects.toThrow('Workbook must contain a Threat_Vulnerability_Assessment sheet');
    expect(userServiceMock.uploadFromWorkbook).not.toHaveBeenCalled();
  });
});
