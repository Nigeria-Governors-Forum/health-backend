import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export const capitalizeWords = (str: string) =>
  str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const normalizeKey = (s?: string) => {
  return (s ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

@Injectable()
export class HealthInsuranceService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealthInsuranceData(state: string, year: string) {
    const yearNum = Number(year);

    // 1. Fetch Demography rows for state & year to get population
    const demographyRows = await this.prisma.demography.findMany({
      where: {
        state: { equals: state, mode: 'insensitive' },
        year: yearNum,
      },
    });

    let totalPopulation: number | null = null;
    const popRow = demographyRows.find((r) => {
      const ind = (r.indicator ?? '').toLowerCase().replace(/\s+/g, '_');
      return (
        ind === 'total_population' ||
        ind === 'population' ||
        (ind.includes('total') && ind.includes('population'))
      );
    });

    if (popRow && popRow.value) {
      totalPopulation = Number(popRow.value);
    }

    // 2. Fetch Insurance_Coverage rows for state & year
    const insuranceRows = await this.prisma.insurance_Coverage.findMany({
      where: {
        state: { equals: state, mode: 'insensitive' },
        year: yearNum,
      },
    });

    // 3. Aggregate Enrollees Breakdown
    const breakdownMap: Record<string, number> = {
      Formal: 0,
      Informal: 0,
      TISHIP: 0,
      BHCPF: 0,
      Equity: 0,
      Others: 0,
    };

    let totalEnrollees = 0;

    insuranceRows.forEach((r) => {
      const rawType = (r.enrollee_type || '').trim();
      const val = Number(r.value ?? 0) || 0;
      totalEnrollees += val;

      const lower = rawType.toLowerCase();
      if (lower.includes('formal') && !lower.includes('informal')) {
        breakdownMap.Formal += val;
      } else if (lower.includes('informal')) {
        breakdownMap.Informal += val;
      } else if (lower.includes('tiship')) {
        breakdownMap.TISHIP += val;
      } else if (lower.includes('bhcpf')) {
        breakdownMap.BHCPF += val;
      } else if (lower.includes('equit') || lower.includes('equiry')) {
        breakdownMap.Equity += val;
      } else if (rawType) {
        breakdownMap.Others += val;
      }
    });

    // 4. Calculate Covered & Not Covered
    // Formula: insurance coverage / the state total population * 100
    let covered = 0;
    if (totalPopulation && totalPopulation > 0) {
      covered = Number(((totalEnrollees / totalPopulation) * 100).toFixed(2));
    }
    const notCovered = Number(Math.max(0, 100 - covered).toFixed(2));

    const breakdown = [
      { label: 'Formal', value: breakdownMap.Formal },
      { label: 'Informal', value: breakdownMap.Informal },
      { label: 'TISHIP', value: breakdownMap.TISHIP },
      { label: 'BHCPF', value: breakdownMap.BHCPF },
      { label: 'Equity', value: breakdownMap.Equity },
      { label: 'Others', value: breakdownMap.Others },
      { label: 'Total', value: totalEnrollees, isTotal: true },
    ];

    return {
      data: {
        state,
        year: yearNum,
        total_population: totalPopulation,
        total_enrollees: totalEnrollees,
        covered,
        not_covered: notCovered,
        insurance_coverage: covered,
        breakdown,
        rows: insuranceRows,
      },
    };
  }

  async getZonalHealthInsuranceData(
    zone: string,
    year?: string,
    state?: string,
  ) {
    let yearNum = year ? Number(year) : NaN;
    if (isNaN(yearNum)) {
      const latestRow = await this.prisma.insurance_Coverage.findFirst({
        orderBy: { year: 'desc' },
        where: { year: { not: null } },
      });
      yearNum = latestRow?.year ?? new Date().getFullYear();
    }

    // Load insurance rows for all states in that year
    const allRows = await this.prisma.insurance_Coverage.findMany({
      where: { year: yearNum },
    });

    // Group enrollees by state
    const stateEnrollees: Record<
      string,
      { state: string; zone?: string | null; total: number }
    > = {};
    allRows.forEach((r) => {
      const rawState = (r.state ?? 'Unknown').trim();
      const key = normalizeKey(rawState);
      if (!stateEnrollees[key]) {
        stateEnrollees[key] = {
          state: rawState,
          zone: r.zone ?? null,
          total: 0,
        };
      }
      stateEnrollees[key].total += Number(r.value ?? 0) || 0;
    });

    // Load demography for all states to calculate coverage percentage
    const demRows = await this.prisma.demography.findMany({
      where: { year: yearNum },
    });
    const demByState = demRows.reduce<Record<string, number>>((acc, row) => {
      const key = normalizeKey(row.state ?? undefined);
      const ind = (row.indicator ?? '').toLowerCase().replace(/\s+/g, '_');
      if (
        ind === 'total_population' ||
        ind === 'population' ||
        (ind.includes('total') && ind.includes('population'))
      ) {
        acc[key] = Number(row.value ?? 0);
      }
      return acc;
    }, {});

    const allStates = Object.keys(stateEnrollees).map((key) => {
      const item = stateEnrollees[key];
      const pop = demByState[key] || 0;
      const coverageRate =
        pop > 0 ? Number(((item.total / pop) * 100).toFixed(2)) : 0;
      const notCoveredRate = Number(Math.max(0, 100 - coverageRate).toFixed(2));
      return {
        state: item.state,
        zone: item.zone,
        total_enrollees: item.total,
        population: pop,
        value: coverageRate,
        rate_graph: coverageRate,
        covered: coverageRate,
        not_covered: notCoveredRate,
      };
    });

    const requestedZoneNorm = normalizeKey(zone);
    const zoneWithin = allStates.filter(
      (s) => normalizeKey(s.zone ?? '') === requestedZoneNorm,
    );

    const nationalCovered: Record<string, number> = {};
    const nationalNotCovered: Record<string, number> = {};
    allStates.forEach((s) => {
      const slug = s.state.toLowerCase().trim().replace(/\s+/g, '-');
      nationalCovered[slug] = s.value;
      nationalNotCovered[slug] = Number(Math.max(0, 100 - s.value).toFixed(2));
    });

    // Trend for state if passed
    const trendRows = await this.prisma.insurance_Coverage.findMany({
      where: state
        ? { state: { equals: state.trim(), mode: 'insensitive' } }
        : {},
      orderBy: { year: 'asc' },
    });

    const trendMap = trendRows.reduce<
      Record<number, { year: number; value: number }>
    >((acc, row) => {
      const y = row.year;
      if (!y) return acc;
      if (!acc[y]) acc[y] = { year: y, value: 0 };
      acc[y].value += Number(row.value ?? 0) || 0;
      return acc;
    }, {});

    const trend = Object.values(trendMap).sort((a, b) => a.year - b.year);

    return {
      data: {
        zone: capitalizeWords(zone),
        year: yearNum,
        state: state ?? null,
        zoneWithin,
        allStates,
        national: nationalCovered,
        covered: nationalCovered,
        not_covered: nationalNotCovered,
        trend,
      },
    };
  }
}

