import { Injectable } from '@nestjs/common';
import { CreateHumanResourceDto } from './dto/create-human-resource.dto';
import { UpdateHumanResourceDto } from './dto/update-human-resource.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HumanResourceService {
  constructor(private readonly prisma: PrismaService) { }

  create(createHumanResourceDto: CreateHumanResourceDto) {
    return 'This action adds a new humanResource';
  }

  findAll() {
    return `This action returns all humanResource`;
  }

  findOne(id: number) {
    return `This action returns a #${id} humanResource`;
  }

  update(id: number, updateHumanResourceDto: UpdateHumanResourceDto) {
    return `This action updates a #${id} humanResource`;
  }

  remove(id: number) {
    return `This action removes a #${id} humanResource`;
  }

  async getHumanResourceData(state: string, year: string) {
    const hRH_Professions = await this.prisma.hRH_Professions.findMany({
      where: { state, year: Number(year) }
    });    

    const hRH = await this.prisma.hRH.findMany({
      where: { state, year: Number(year) }
    });

    const group = hRH.reduce((acc: any, item) => {
      const inst = item?.institution?.trim(); // clean up spaces
      if (!inst) {
        return acc;
      }
      if (!acc[inst]) {
        acc[inst] = { institution: inst, private: 0, public: 0, total: 0 };
      }

      // const value = item?.value ?? 0;

      if (item?.ownership?.toLowerCase().includes("private")) {
        acc[inst].private += item.value ?? 0;
      } else if (item?.ownership?.toLowerCase().includes("public")) {
        acc[inst].public += item.value ?? 0;
      }

      acc[inst].total = acc[inst].private + acc[inst].public;

      return acc;
    }, {} as Record<string, { institution: string; private: number; public: number, total: number }>);

    const grouped = Object.values(group);

    const grandTotal = grouped.reduce(
      (acc: any, row: any) => {
        acc.private += row.private;
        acc.public += row.public;
        acc.total += row.total;
        return acc;
      },
      { institution: "Total", private: 0, public: 0, total: 0 }
    );
    grouped.push(grandTotal);

    return {
      data: {
        hRH_Professions: hRH_Professions.reduce((acc, cur) => acc + (Number(cur.number) || 0), 0),
        training_breakdown: grouped,
        hRH: hRH.reduce((acc, cur) => acc + (Number(cur?.value) || 0), 0),
        profession: hRH_Professions,
      },
    };
  }
}
