import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const normalizeKey = (value: string | null | undefined) =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

@Injectable()
export class PartnersMappingService {
  constructor(private readonly prisma: PrismaService) {}

  async getPartnersMappingData(state: string, year: string) {
    const yearNum = Number(year);
    const partners = await this.prisma.partners_Mapping.findMany({
      where: {
        state: { equals: state.trim(), mode: 'insensitive' },
        year: yearNum,
      },
      orderBy: [{ partner: 'asc' }, { intervention_area: 'asc' }],
    });

    return {
      data: {
        state,
        year: yearNum,
        partners,
      },
    };
  }

  async getZonalPartnersMappingData(
    zone: string,
    year?: string,
    state?: string,
  ) {
    let yearNum = year ? Number(year) : NaN;
    if (!Number.isFinite(yearNum)) {
      const latestRow = await this.prisma.partners_Mapping.findFirst({
        where: { year: { not: null } },
        orderBy: { year: 'desc' },
        select: { year: true },
      });
      yearNum = latestRow?.year ?? new Date().getFullYear();
    }

    const [currentRows, trendRows] = await Promise.all([
      this.prisma.partners_Mapping.findMany({
        where: { year: yearNum },
        orderBy: [{ state: 'asc' }, { partner: 'asc' }],
      }),
      state?.trim()
        ? this.prisma.partners_Mapping.findMany({
            where: {
              state: { equals: state.trim(), mode: 'insensitive' },
              year: { not: null },
            },
            orderBy: [{ year: 'asc' }, { partner: 'asc' }],
          })
        : Promise.resolve([]),
    ]);

    const requestedZone = normalizeKey(zone);
    const zoneWithin = currentRows.filter(
      (row) => normalizeKey(row.zone) === requestedZone,
    );

    const trend = trendRows
      .filter((row) => row.year !== null)
      .map((row) => ({
        year: row.year,
        partner: row.partner,
        intervention_area: row.intervention_area,
        coverage_area: row.coverage_area,
      }));

    return {
      data: {
        zone,
        year: yearNum,
        state: state ?? null,
        zoneWithin,
        allStates: currentRows,
        trend,
      },
    };
  }
}
