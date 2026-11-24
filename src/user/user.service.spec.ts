import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    demography: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    demography_LGA: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    health_Facilities: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    health_Fac_Service_Provision: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    hRH: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    health_Training_Institutions: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    admission_Quota: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    insurance_Coverage: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    scorecards: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    access_Service_Utilization: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    health_Outcomes: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    partners_Mapping: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    hFin: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uploads all Demography schema fields with the expected types', async () => {
    mockPrismaService.demography.findMany.mockResolvedValue([]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2023,
        Section: 'Demography',
        Indicator: 'Population',
        Value: '123',
        Category_1: 'Urban',
        Category_2: 'Female',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Demography');

    await service.uploadFromWorkbook(workbook, 2023);

    expect(mockPrismaService.demography.createMany).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2023,
          page: 'Demography',
          indicator: 'Population',
          value: 123,
          category_1: 'Urban',
          category_2: 'Female',
        },
      ],
    });
  });

  it('maps Demography_LGA columns to the schema fields and parses numeric values', async () => {
    mockPrismaService.demography_LGA.findMany.mockResolvedValue([]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2023,
        Section: 'Demography',
        LGA: 'Aba North',
        LGA_Population: '123.5',
        Number_of_Wards: '12',
        Hard_to_Reach_Wards: '3',
        Hard_to_Reach_LGAs: 'Yes',
        Health_Facilities: '78',
        Density: '4',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Demography_LGA');

    await service.uploadFromWorkbook(workbook, 2023);

    expect(mockPrismaService.demography_LGA.createMany).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2023,
          page: 'Demography',
          lga: 'Aba North',
          lga_population: 123.5,
          number_of_wards: 12,
          hard_to_reach_wards: 3,
          hard_to_reach_colour: 'Yes',
          health_facilities: 78,
          density: 4,
        },
      ],
    });
  });

  it('uploads all Health_Facilities schema fields and parses integer values', async () => {
    mockPrismaService.health_Facilities.findMany.mockResolvedValue([]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2022,
        Page: 'Health_Facility',
        Indicator: 'Number of Health Facilities',
        Level: 'Primary',
        Ownership: 'Private',
        Value: '219',
        State_Population: '4340370',
      },
      {
        Zone: 'North East',
        State: 'Adamawa',
        Year: 2022,
        Page: 'Health_Facility',
        Indicator: 'Number of Health Facilities',
        Level: 'Primary',
        Ownership: 'Private',
        Value: 'No Data',
        State_Population: '5005472',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Health_Facilities');

    await service.uploadFromWorkbook(workbook, 2022);

    expect(mockPrismaService.health_Facilities.createMany).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2022,
          page: 'Health_Facility',
          indicator: 'Number of Health Facilities',
          level: 'Primary',
          ownership: 'Private',
          value: 219,
          state_population: 4340370,
        },
        {
          zone: 'North East',
          state: 'Adamawa',
          year: 2022,
          page: 'Health_Facility',
          indicator: 'Number of Health Facilities',
          level: 'Primary',
          ownership: 'Private',
          value: null,
          state_population: 5005472,
        },
      ],
    });
  });

  it('uploads all Health_Fac_Service_Provision fields with numeric types', async () => {
    mockPrismaService.health_Fac_Service_Provision.findMany.mockResolvedValue(
      [],
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2023,
        Page: 'Facilities',
        Service_Provision: 'ANC',
        Number: '918',
        Percentage: '0.7568013190436933',
      },
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Health_Fac_Service_Provision',
    );

    await service.uploadFromWorkbook(workbook, 2023);

    expect(
      mockPrismaService.health_Fac_Service_Provision.createMany,
    ).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2023,
          page: 'Facilities',
          service_provision: 'ANC',
          number: 918,
          percentage: 0.7568013190436933,
        },
      ],
    });
  });

  it('uploads all HRH schema fields with their numeric types', async () => {
    mockPrismaService.hRH.findMany.mockResolvedValue([]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2022,
        Page: 'HRH',
        Indicator: 'Medical Doctors',
        Values: '114',
        Density: '0.0123',
        Target: '10.5',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'HRH');

    await service.uploadFromWorkbook(workbook, 2022);

    expect(mockPrismaService.hRH.createMany).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2022,
          page: 'HRH',
          indicator: 'Medical Doctors',
          values: 114,
          density: 0.0123,
          target: 10.5,
        },
      ],
    });
  });

  it('uploads all Health_Training_Institutions fields to its own model', async () => {
    mockPrismaService.health_Training_Institutions.findMany.mockResolvedValue(
      [],
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2022,
        Page: 'Health_training_institution',
        Institution: 'Colleges of Medicine',
        Ownership: 'Private',
        Value: '1',
      },
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Health_Training_Institutions',
    );

    await service.uploadFromWorkbook(workbook, 2022);

    expect(
      mockPrismaService.health_Training_Institutions.createMany,
    ).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2022,
          page: 'Health_training_institution',
          institution: 'Colleges of Medicine',
          ownership: 'Private',
          value: 1,
        },
      ],
    });
    expect(mockPrismaService.hRH.createMany).not.toHaveBeenCalled();
  });

  it('uses indicator and faculty as the Admission_Quota identity', async () => {
    mockPrismaService.admission_Quota.findMany.mockResolvedValue([
      {
        id: 1,
        zone: 'South East',
        state: 'Abia',
        year: 2022,
        page: 'Admission_quota',
        indicator: 'Colleges of Medicine',
        faculty: 'Dentistry',
        value: 0,
      },
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2022,
        Page: 'Admission_quota',
        Indicator: 'Schools of Health Technology',
        Faculty: 'Dentistry',
        Value: '500',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admission_Quota');

    await service.uploadFromWorkbook(workbook, 2022);

    expect(mockPrismaService.admission_Quota.createMany).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2022,
          page: 'Admission_quota',
          indicator: 'Schools of Health Technology',
          faculty: 'Dentistry',
          value: 500,
        },
      ],
    });
    expect(mockPrismaService.admission_Quota.update).not.toHaveBeenCalled();
  });

  it('uses enrollee_type to distinguish Insurance_Coverage records', async () => {
    mockPrismaService.insurance_Coverage.findMany.mockResolvedValue([
      {
        id: 1,
        zone: 'South East',
        state: 'Abia',
        year: 2022,
        page: 'Insurance_coverage',
        indicator: 'Insurance Coverage',
        enrollee_type: 'Formal',
        value: 0,
      },
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2022,
        Page: 'Insurance_coverage',
        Indicator: 'Insurance Coverage',
        'Enrollee Type': 'Informal',
        Value: '25',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Insurance_Coverage');

    await service.uploadFromWorkbook(workbook, 2022);

    expect(
      mockPrismaService.insurance_Coverage.createMany,
    ).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2022,
          page: 'Insurance_coverage',
          indicator: 'Insurance Coverage',
          enrollee_type: 'Informal',
          value: 25,
        },
      ],
    });
    expect(mockPrismaService.insurance_Coverage.update).not.toHaveBeenCalled();
  });

  it('preserves Scorecards labels and distinguishes rounds', async () => {
    mockPrismaService.scorecards.findMany.mockResolvedValue([
      {
        id: 1,
        zone: 'South East',
        state: 'Abia',
        year: 2022,
        page: 'Scorecards',
        name: 'Health Insurance',
        indicator: 'SSHIA Established',
        value: 'Yes',
        round: 'Round 1',
      },
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2022,
        Page: 'Scorecards',
        Name: 'Health Insurance',
        Indicator: 'SSHIA Established',
        Value: 'Yes',
        Round: 'Round 1',
      },
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2022,
        Page: 'Scorecards',
        Name: 'Health Insurance',
        Indicator: 'SSHIA Established',
        Value: 'Missing Validation',
        Round: 'Round 2',
      },
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2022,
        Page: 'Scorecards',
        Name: 'Health Insurance',
        Indicator: 'SSHIA Established',
        Value: 'No  ',
        Round: 'Round 3',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Scorecards');

    await service.uploadFromWorkbook(workbook, 2022);

    expect(mockPrismaService.scorecards.createMany).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2022,
          page: 'Scorecards',
          name: 'Health Insurance',
          indicator: 'SSHIA Established',
          value: 'Missing Validation',
          round: 'Round 2',
        },
        {
          zone: 'South East',
          state: 'Abia',
          year: 2022,
          page: 'Scorecards',
          name: 'Health Insurance',
          indicator: 'SSHIA Established',
          value: 'No',
          round: 'Round 3',
        },
      ],
    });
    expect(mockPrismaService.scorecards.update).not.toHaveBeenCalled();
  });

  it('preserves utilization decimals and uses calendar_year for records', async () => {
    mockPrismaService.access_Service_Utilization.findMany.mockResolvedValue([
      {
        id: 1,
        zone: 'South East',
        state: 'Abia',
        calendar_year: 2022,
        data_year: '2018',
        page: 'Access_Service_Utilization',
        indicator: '1st ANC Visit',
        source: null,
        value: 0.89,
        target: 0.95,
      },
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Calendar_Year: 2022,
        Data_Year: 2018,
        Page: 'Access_Service_Utilization',
        Indicator: '1st ANC Visit',
        Value: '0.89',
        Target: '0.95',
      },
      {
        Zone: 'South East',
        State: 'Abia',
        Data_Year: 2023,
        Page: 'Access_Service_Utilization',
        Indicator: '1st ANC Visit',
        Source: 'NHMIS',
        Value: '0.81',
        Target: '0.95',
      },
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Access_Service_Utilization',
    );

    await service.uploadFromWorkbook(workbook, 2024);

    expect(
      mockPrismaService.access_Service_Utilization.createMany,
    ).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          calendar_year: null,
          data_year: '2023',
          page: 'Access_Service_Utilization',
          indicator: '1st ANC Visit',
          source: 'NHMIS',
          value: 0.81,
          target: 0.95,
        },
      ],
    });
    expect(
      mockPrismaService.access_Service_Utilization.update,
    ).not.toHaveBeenCalled();
  });

  it('preserves Health_Outcomes decimals and normalizes both year fields', async () => {
    mockPrismaService.health_Outcomes.findMany.mockResolvedValue([
      {
        id: 1,
        zone: 'South East',
        state: 'Abia',
        calendar_year: 2022,
        data_year: '2018',
        page: 'Health_Outcomes',
        indicator: 'Zero Dose Children',
        source: null,
        value: 19076,
        target: 0,
      },
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'South East',
        State: 'Abia',
        Calendar_Year: 2023,
        Data_Year: 2018,
        Page: 'Health_Outcomes',
        Indicator: 'Zero Dose Children',
        Source: 'NDHS',
        Value: '0.145',
        Target: '0.95',
      },
      {
        Zone: 'South East',
        State: 'Abia',
        Calendar_Year: 2022,
        Data_Year: 2018,
        Page: 'Health_Outcomes',
        Indicator: 'Infant Mortality',
        Value: 'No Data',
        Target: '0.95',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Health_Outcomes');

    await service.uploadFromWorkbook(workbook, 2023);

    expect(mockPrismaService.health_Outcomes.createMany).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          calendar_year: 2023,
          data_year: '2018',
          page: 'Health_Outcomes',
          indicator: 'Zero Dose Children',
          source: 'NDHS',
          value: 0.145,
          target: 0.95,
        },
        {
          zone: 'South East',
          state: 'Abia',
          calendar_year: 2022,
          data_year: '2018',
          page: 'Health_Outcomes',
          indicator: 'Infant Mortality',
          value: null,
          target: 0.95,
        },
      ],
    });
    expect(mockPrismaService.health_Outcomes.update).not.toHaveBeenCalled();
  });

  it('maps the Health_Fin sheet to HFin and preserves finance fields', async () => {
    mockPrismaService.hFin.findMany.mockResolvedValue([
      {
        id: 1,
        zone: 'South East',
        state: 'Abia',
        year: 2025,
        Page: 'Health_fin',
        category: 'Budgeted',
        indicator: 'Health Budget',
        exp_type: 'Personnel',
        program_classification: 'Health Governance',
        value: 19353415140,
      },
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'North East',
        State: 'Adamawa',
        Year: 2021,
        Type: 'Actual',
        Page: 'Health_fin',
        Indicator: 'Health Budget',
        'Budget Type': 'Actual',
        'Exp Type': 'Overhead',
        'Value ': '239661899.6',
      },
      {
        Zone: 'South East',
        State: 'Abia',
        Year: 2025,
        Type: 'Budgeted',
        Page: 'Health_fin',
        Indicator: 'Health Budget',
        'Budget Type': 'Budgeted',
        'Program Classification': 'Community engagement',
        'Exp Type': 'Personnel',
        'Value ': '0',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Health_Fin');

    await service.uploadFromWorkbook(workbook, 2025);

    expect(mockPrismaService.hFin.createMany).toHaveBeenCalledWith({
      data: [
        {
          zone: 'North East',
          state: 'Adamawa',
          year: 2021,
          Page: 'Health_fin',
          category: 'Actual',
          indicator: 'Health Budget',
          exp_type: 'Overhead',
          value: 239661899.6,
        },
        {
          zone: 'South East',
          state: 'Abia',
          year: 2025,
          Page: 'Health_fin',
          category: 'Budgeted',
          indicator: 'Health Budget',
          exp_type: 'Personnel',
          program_classification: 'Community engagement',
          value: 0,
        },
      ],
    });
    expect(mockPrismaService.hFin.update).not.toHaveBeenCalled();
  });

  it('normalizes Partners_Mapping locations and preserves coverage labels', async () => {
    mockPrismaService.partners_Mapping.findMany.mockResolvedValue([
      {
        id: 1,
        zone: 'South East',
        state: 'Abia',
        year: 2022,
        page: 'Partners_Mapping',
        partner: 'UNFPA',
        intervention_area: 'Sexual, Reproductive & Maternal Health',
        coverage_area: 'State Wide',
      },
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Zone: 'Abia',
        State: 'South East',
        Year: 2022,
        Page: 'Partners_Mapping',
        Partner: 'UNFPA',
        'Intervention Area': 'Sexual, Reproductive & Maternal Health',
        Coverage_Area: '4 LGAs',
      },
      {
        Zone: 'Nortth Central',
        State: 'Plateau',
        Year: 2022,
        Page: 'Partners_Mapping',
        Partner: 'APIN',
        'Intervention Area': 'Immunization',
        Coverage_Area: 5,
      },
      {
        Zone: 'South West',
        State: 'Lagos',
        Year: 2022,
        Page: 'Partners_Mapping',
        Partner: 'MSI',
        'Intervention Area': 'Maternal Health',
        Coverage_Area: 'State Wide',
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Partners_Mapping');

    await service.uploadFromWorkbook(workbook, 2022);

    expect(
      mockPrismaService.partners_Mapping.createMany,
    ).toHaveBeenCalledWith({
      data: [
        {
          zone: 'South East',
          state: 'Abia',
          year: 2022,
          page: 'Partners_Mapping',
          partner: 'UNFPA',
          intervention_area: 'Sexual, Reproductive & Maternal Health',
          coverage_area: '4 LGAs',
        },
        {
          zone: 'North Central',
          state: 'Plateau',
          year: 2022,
          page: 'Partners_Mapping',
          partner: 'APIN',
          intervention_area: 'Immunization',
          coverage_area: '5',
        },
        {
          zone: 'South West',
          state: 'Lagos',
          year: 2022,
          page: 'Partners_Mapping',
          partner: 'MSI',
          intervention_area: 'Maternal Health',
          coverage_area: 'State Wide',
        },
      ],
    });
    expect(mockPrismaService.partners_Mapping.update).not.toHaveBeenCalled();
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'old-hashed-password' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, password: 'new-hashed-password' });

      const result = await service.resetPassword('test@example.com', 'newPassword123');

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword('nonexistent@example.com', 'newPassword123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
