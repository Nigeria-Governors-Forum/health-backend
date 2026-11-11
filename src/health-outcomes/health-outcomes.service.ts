import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const normalizeKey = (value: string | null | undefined) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

@Injectable()
export class HealthOutcomesService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealthOutcomesData(state: string, year: string) {
    const yearNum = Number(year);
    const outcomes = await this.prisma.health_Outcomes.findMany({
      where: {
        state: { equals: state.trim(), mode: 'insensitive' },
        calendar_year: yearNum,
      },
      orderBy: [{ indicator: 'asc' }, { source: 'asc' }],
    });

    return {
      data: {
        state,
        year: yearNum,
        outcomes,
      },
    };
  }

  async getZonalHealthOutcomesData(
    zone: string,
    state: string,
    year?: string,
    indicator?: string,
  ) {
    let yearNum = year ? Number(year) : NaN;
    if (!Number.isFinite(yearNum)) {
      const latestRow = await this.prisma.health_Outcomes.findFirst({
        where: { calendar_year: { not: null } },
        orderBy: { calendar_year: 'desc' },
        select: { calendar_year: true },
      });
      yearNum = latestRow?.calendar_year ?? new Date().getFullYear();
    }

    const indicatorFilter = indicator?.trim()
      ? {
          indicator: { equals: indicator.trim(), mode: 'insensitive' as const },
        }
      : {};

    const currentRows = await this.prisma.health_Outcomes.findMany({
      where: {
        calendar_year: yearNum,
        ...indicatorFilter,
      },
      orderBy: [{ state: 'asc' }, { indicator: 'asc' }, { source: 'asc' }],
    });

    const trendRows = await this.prisma.health_Outcomes.findMany({
      where: {
        state: { equals: state.trim(), mode: 'insensitive' },
        calendar_year: { not: null },
        ...indicatorFilter,
      },
      orderBy: [
        { calendar_year: 'asc' },
        { indicator: 'asc' },
        { source: 'asc' },
      ],
    });

    const requestedZone = normalizeKey(zone);
    const zoneWithin = currentRows.filter(
      (row) => normalizeKey(row.zone) === requestedZone,
    );

    const trend = trendRows
      .filter((row) => row.calendar_year !== null)
      .map((row) => ({
        year: row.calendar_year,
        indicator: row.indicator,
        source: row.source,
        value: row.value,
        target: row.target,
      }));

    return {
      data: {
        zone,
        year: yearNum,
        state,
        zoneWithin,
        allStates: currentRows,
        trend,
      },
    };
  }
}
