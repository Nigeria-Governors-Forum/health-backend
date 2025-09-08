import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
      where: { state, year: Number(year) }
    });

    const data: Record<string, number | null> = {};
    rows.forEach((row) => {
      const key = row.indicator
        ? row.indicator.toLowerCase().replace(/\s+/g, "_")
        : "";
      if (key) data[key] = row.value;
    });

    const hFacilities = await this.prisma.hFcilities.findMany({
      where: { state, year: Number(year) }
    });

    const hRH_Professions = await this.prisma.hRH_Professions.findMany({
      where: { state, year: Number(year) }
    });

    const hRH = await this.prisma.hRH.findMany({
      where: { state, year: Number(year) }
    });

    const insuranceCoverage = await this.prisma.insurance_Coverage.findMany({
      where: { state, year: Number(year) }
    });
    const totalValue = insuranceCoverage.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

    const partnersMapping = await this.prisma.partners_Mapping.findMany({
      where: { state, year: Number(year) }
    });

    const uniquePartners = [
      ...new Set(partnersMapping.map((p) => p.partner?.trim()))
    ].filter(Boolean);

    const demography_LGA = await this.prisma.demography_LGA.findMany({
      where: { state, year: Number(year) }
    });

    const hardToReachLGAs = demography_LGA
      .filter(item => item.hard_to_reach_lgas === "Yes")
      .map(item => ({
        lga: item.lga,
        hard_to_reach: item.hard_to_reach_lgas
      }));

    const totalHardToReach = hardToReachLGAs.length;

    const nDHS = await this.prisma.nDHS.findMany({
      where: {
        state,
        year: { in: [Number(year) - 2, Number(year) - 1, Number(year)] }
      }
    });

    // filter to only the indicators we care about
    const graphData = nDHS.filter(item =>
      ["4th ANC Visit", "Stunting"].includes(item?.indicator?.trim() ?? "")
    );

    const result = [Number(year) - 2, Number(year) - 1, Number(year)].map(y => {
      const yearData = graphData.filter(item => item.year === y);

      const stunting = yearData.find(item => item?.indicator?.trim() === "Stunting");
      const zeroDose = stunting ? 100 - (stunting.value ?? 0) : null;

      return {
        year: y,
        data: [
          ...yearData.map(item => ({
            indicator: item?.indicator?.trim(),
            value: item?.value
          })),
          ...(zeroDose !== null
            ? [{ indicator: "Zero Dose", value: zeroDose }]
            : [])
        ]
      };
    });

    const totals = hFacilities.reduce((acc, f) => {
      const level = f.level ?? "Unknown";
      const value = f.value ?? 0;
      acc[level] = (acc[level] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    return {
      data: {
        year_created: data["year_created"] ?? null,
        land_mass: data["land_mass"] ?? null,
        no_of_lgas: data["no_of_lgas"] ?? null,
        political_wards: data["political_wards"] ?? null,
        total_population: data["total_population"] ?? null,
        healthFacilities: Object.values(totals).reduce<number>(
          (a, b) => a + b,
          0
        ),
        insurance_coverage:
          data["total_population"] && data["total_population"] > 0
            ? Math.round((totalValue / data["total_population"]) * 100)
            : null,
        partners_mapping: uniquePartners.length,
        hRH: hRH.reduce((acc, cur) => acc + (Number(cur?.value) || 0), 0),
        hRH_Professions: hRH_Professions.reduce((acc, cur) => acc + (Number(cur.number) || 0), 0),
        graphData: result,
        demography_LGA,
        totalHardToReach,
      },
    };
  }

}

