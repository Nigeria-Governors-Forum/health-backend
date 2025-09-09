import { Injectable } from '@nestjs/common';
import { CreateDemographyDto } from './dto/create-demography.dto';
import { UpdateDemographyDto } from './dto/update-demography.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DemographyService {

  constructor(private readonly prisma: PrismaService) { }

  create(createDemographyDto: CreateDemographyDto) {
    return 'This action adds a new demography';
  }

  findAll() {
    return `This action returns all demography`;
  }

  findOne(id: number) {
    return `This action returns a #${id} demography`;
  }

  update(id: number, updateDemographyDto: UpdateDemographyDto) {
    return `This action updates a #${id} demography`;
  }

  remove(id: number) {
    return `This action removes a #${id} demography`;
  }

  async getDemographyData(state: string, year: string) {
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

    const hFacilities = await this.prisma.hFcilities.findMany({
      where: { state, year: Number(year) }
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
        under_1: data["under_1"] ?? null,
        under_5: data["under_5"] ?? null,
        wcba: data["wcba"] ?? null,
        pregnant_women: data["pregnant_women"] ?? null,
        demography_LGA,
        total_Hard_To_Reach: totalHardToReach,
        health_facilities: Object.values(totals).reduce<number>(
          (a, b) => a + b,
          0
        ),
      },
    };
  }
}
