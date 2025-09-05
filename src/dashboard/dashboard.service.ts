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
      where: {
        state: state,
        year: Number(year)
      }
    });

    const data: Record<string, number | null> = {};
    rows.forEach((row) => {
      const key = row.indicator
        ? row.indicator.toLowerCase().replace(/\s+/g, "_")
        : ""; // normalize indicator names, handle null
      if (key) {
        data[key] = row.value;
      }
    });
    
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
      },
    };
  }
}

