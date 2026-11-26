import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { equal } from 'assert';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) { }

  create(createDashboardDto: CreateDashboardDto) {
    return 'This action adds a new dashboard';
  }

  findAll() {
    return `This action returns all dashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }

  async getDashboardData(state: string, year: string) {
    const rows = await this.prisma.demography.findMany({
      where: { state, year: Number(year) },
    });

    const data: Record<string, number | null> = {};

    rows.forEach((row) => {
      const key = row.indicator
        ? row.indicator.toLowerCase().replace(/\s+/g, '_')
        : '';
      if (key) data[key] = row.value;
    });

    const hFacilities = await this.prisma.health_Facilities.findMany({
      where: { state, year: Number(year) },
    });

    const HRH = await this.prisma.hRH.findMany({
      where: { state, year: Number(year) },
    });

    const healthTrainingInstitutions = await this.prisma.health_Training_Institutions.findMany({
      where: { state, year: Number(year) },
    });

    const insuranceCoverage = await this.prisma.insurance_Coverage.findMany({
      where: { state, year: Number(year) },
    });
    const totalValue = insuranceCoverage.reduce(
      (sum, item) => sum + (Number(item.value) || 0),
      0,
    );

    const demography_LGA = await this.prisma.demography_LGA.findMany({
      where: { state, year: Number(year) },
    });

    const hardToReachLGAs = demography_LGA
      .filter((item) => Number(item.hard_to_reach_colour ?? 0) > 0)
      .map((item) => ({
        lga: item.lga,
        hard_to_reach: item.hard_to_reach_colour,
      }));

    const totalHardToReach = hardToReachLGAs.length;

    // const numYear = Number(year);
    // const targetYears = [numYear - 2, numYear - 1, numYear];
    // const targetYearStrings = targetYears.map(String);

    // const access_Service_Utilization =
    //   await this.prisma.access_Service_Utilization.findMany({
    //     where: {
    //       state: { equals: state, mode: 'insensitive' },
    //       OR: [
    //         { data_year: { in: targetYearStrings } },
    //         { calendar_year: { in: targetYears } },
    //       ],
    //       indicator: {
    //         equals: '4th ANC Visit',
    //         mode: 'insensitive',
    //       }
    //     },
    //   });

    // const healthOutcome = await this.prisma.health_Outcomes.findMany({
    //   where: {
    //     state: {
    //       equals: state,
    //       mode: 'insensitive',
    //     },
    //     OR: [
    //       { data_year: { in: targetYearStrings } },
    //       { calendar_year: { in: targetYears } },
    //     ],
    //     indicator: {
    //       in: ['Children with Stunting', 'Zero Dose'],
    //       mode: 'insensitive',
    //     },
    //   },
    // });

    // const graphData = [
    //   ...access_Service_Utilization,
    //   ...healthOutcome,
    // ];

    // const result = targetYears.map((y) => {
    //   const yearData = graphData.filter(
    //     (item) =>
    //       Number(item.data_year ?? item.calendar_year) === y,
    //   );

    //   const ancVisit = yearData.find(
    //     (item) => item.indicator?.trim() === '4th ANC Visit',
    //   );

    //   const stunting = yearData.find(
    //     (item) => item.indicator?.trim() === 'Children with Stunting',
    //   );

    //   const zeroDose = yearData.find(
    //     (item) => item.indicator?.trim() === 'Zero Dose',
    //   );

    //   return {
    //     year: y,
    //     fourth_anc_visit: ancVisit?.value ?? null,
    //     stunting: stunting?.value ?? null,
    //     zero_dose: zeroDose?.value ?? null,
    //   };
    // });

    const numYear = Number(year);

    const FIRST_YEAR = 2018;
    const YEAR_INTERVAL = 5;
    const MAX_YEARS = 3;

    // Generate all released years up to the requested year
    const availableYears: number[] = [];

    if (numYear < FIRST_YEAR) {
      availableYears.push(FIRST_YEAR, FIRST_YEAR + YEAR_INTERVAL);
    } else {
      const latestAvailableYear =
        FIRST_YEAR +
        Math.floor((numYear - FIRST_YEAR) / YEAR_INTERVAL) *
        YEAR_INTERVAL;

      for (
        let y = FIRST_YEAR;
        y <= latestAvailableYear;
        y += YEAR_INTERVAL
      ) {
        availableYears.push(y);
      }

      // Keep at most the latest 3 years
      if (availableYears.length > MAX_YEARS) {
        availableYears.splice(0, availableYears.length - MAX_YEARS);
      }

      // Ensure a minimum of 2 years
      if (availableYears.length < 2) {
        availableYears.push(availableYears[0] + YEAR_INTERVAL);
      }
    }

    const targetYears = availableYears;
    const targetYearStrings = targetYears.map(String);

    const access_Service_Utilization =
      await this.prisma.access_Service_Utilization.findMany({
        where: {
          state: { equals: state, mode: 'insensitive' },
          OR: [
            { data_year: { in: targetYearStrings } },
            { calendar_year: { in: targetYears } },
          ],
          indicator: {
            equals: '4th ANC Visit',
            mode: 'insensitive',
          },
        },
      });

    const healthOutcome = await this.prisma.health_Outcomes.findMany({
      where: {
        state: {
          equals: state,
          mode: 'insensitive',
        },
        OR: [
          { data_year: { in: targetYearStrings } },
          { calendar_year: { in: targetYears } },
        ],
        AND: [
          {
            OR: [
              {
                indicator: {
                  contains: 'Children with Stunting',
                  mode: 'insensitive',
                },
              },
              {
                indicator: {
                  contains: 'Zero Dose',
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
    });

    const graphData = [
      ...access_Service_Utilization,
      ...healthOutcome,
    ];

    const result = targetYears.map((y) => {
      const yearData = graphData.filter(
        (item) => Number(item.data_year ?? item.calendar_year) === y,
      );

      const ancVisit = yearData.find(
        (item) => item.indicator?.trim().toLowerCase() === '4th anc visit',
      );

      const stunting = yearData.find(
        (item) =>
          item.indicator?.trim().toLowerCase() === 'children with stunting',
      );

      const zeroDose = yearData.find(
        (item) => item.indicator?.trim().toLowerCase() === 'zero dose',
      );

      return {
        year: y,
        fourth_anc_visit: ancVisit?.value ?? null,
        stunting: stunting?.value ?? null,
        zero_dose: zeroDose?.value ?? null,
      };
    });

    const totals = hFacilities.reduce(
      (acc, f) => {
        const level = f.level ?? 'Unknown';
        const value = f.value ?? 0;
        acc[level] = (acc[level] || 0) + value;
        return acc;
      },
      {} as Record<string, number>,
    );

    const healthFinancing = await this.prisma.health_Fin.findMany({
      where: {
        state: { equals: state, mode: 'insensitive' },
        year: Number(year),
        indicator: {
          equals: 'Health Allocation (%)',
          mode: 'insensitive'
        }
      },
    });


    return {
      data: {
        year_created: data['year_created'] ?? null,
        land_mass: data['land_mass'] ?? null,
        no_of_lgas: data['lgas'] ?? null,
        political_wards: data['political_wards'] ?? null,
        total_population: data['total_population'] ?? null,
        health_facilities: Object.values(totals).reduce<number>(
          (a, b) => a + b,
          0,
        ),
        insurance_coverage:
          data['total_population'] && data['total_population'] > 0
            ? Math.round((totalValue / data['total_population']) * 100)
            : null,
        health_training_institutions: healthTrainingInstitutions.reduce((acc, cur) => acc + (Number(cur?.value) || 0), 0),
        total_HRH: HRH.reduce(
          (acc, cur) => acc + (Number(cur.values ?? 0) || 0),
          0,
        ),
        graph_data: result,
        demography_LGA,
        total_Hard_To_Reach: totalHardToReach,
        healthFin: healthFinancing,
      },
    };
  }

  async getFlagshipProjects(state: string, year: string) {
    const projects = await this.prisma.flagship_Project.findMany({
      where: {
        state,
        year: Number(year),
      },
    });
    return { data: projects };
  }
}
