import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceCoverageService {
  constructor(private readonly prisma: PrismaService) {}

  async getServiceCoverageData(state: string, year: number) {
    const rows = await this.prisma.access_Service_Utilization.findMany({
      where: { state, year },
    });

    const indicators: Record<string, { value: number; target: number }> = {};
    rows.forEach((r) => {
      if (r.indicator) {
        // Multiply by 100 to convert float rate (e.g. 0.45) to integer percentage (45%)
        indicators[r.indicator.trim()] = {
          value:
            r.value !== null && r.value !== undefined
              ? Math.round(r.value * 100)
              : 0,
          target:
            r.target !== null && r.target !== undefined
              ? Math.round(r.target * 100)
              : 0,
        };
      }
    });

    return { data: indicators };
  }

  async getZonalServiceCoverage(
    zone: string,
    state: string,
    year: number,
    indicator: string,
  ) {
    // 1. Zonal states data
    const zonalRows = await this.prisma.access_Service_Utilization.findMany({
      where: {
        zone: { equals: zone, mode: 'insensitive' },
        year,
        indicator: { equals: indicator, mode: 'insensitive' },
      },
    });

    const statesList = zonalRows
      .map((r) => ({
        label: r.state || '',
        value:
          r.value !== null && r.value !== undefined
            ? Math.round(r.value * 100)
            : 0,
      }))
      .filter((item) => item.label !== '');

    // 2. National data
    const nationalRows = await this.prisma.access_Service_Utilization.findMany({
      where: {
        year,
        indicator: { equals: indicator, mode: 'insensitive' },
      },
    });

    const nationalData: Record<string, number> = {};
    nationalRows.forEach((r) => {
      if (r.state) {
        // Normalize state name to match frontend slugs (e.g. "Cross River" -> "cross-river")
        const slug = r.state.toLowerCase().trim().replace(/\s+/g, '-');
        nationalData[slug] =
          r.value !== null && r.value !== undefined
            ? Math.round(r.value * 100)
            : 0;
      }
    });

    // 3. Trend data
    const trendRows = await this.prisma.access_Service_Utilization.findMany({
      where: {
        state,
        indicator: { equals: indicator, mode: 'insensitive' },
        year: { gte: year - 4, lte: year },
      },
      orderBy: { year: 'asc' },
    });

    const trend = trendRows.map((r) => ({
      year: r.year,
      value:
        r.value !== null && r.value !== undefined
          ? Math.round(r.value * 100)
          : 0,
    }));

    return {
      data: {
        states: statesList,
        national: nationalData,
        trend,
      },
    };
  }
}
