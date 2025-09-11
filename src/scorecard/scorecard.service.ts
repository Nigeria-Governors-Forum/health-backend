import { Injectable } from '@nestjs/common';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ScorecardService {
  constructor(private readonly prisma: PrismaService) { }

  create(createScorecardDto: CreateScorecardDto) {
    return 'This action adds a new scorecard';
  }

  findAll() {
    return `This action returns all scorecard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scorecard`;
  }

  update(id: number, updateScorecardDto: UpdateScorecardDto) {
    return `This action updates a #${id} scorecard`;
  }

  remove(id: number) {
    return `This action removes a #${id} scorecard`;
  }

  async getScorecardData(state: string, year: string, category: string) {

    console.log(state, year, category);
    
    const scorecard = await this.prisma.scorecards.findMany({
      where: {
        state,
        year: Number(year),
        name: {
          contains: category.trim(),
          mode: "insensitive",
        },
      }
    });

    // console.log('score', scorecard);
    return {
      data: {
        scorecard
      },
    };
  }
}
