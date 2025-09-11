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

  async getScorecardData(state: string, year: string, category: string, round?: string) {
    console.log(state, year, category, round);

    // First, fetch ALL scorecards for that year + category
    // const scorecards = await this.prisma.scorecards.findMany({
    //   where: {
    //     //if year is undefined, then use round
    //     year: Number(year),
    //     name: {
    //       contains: category.trim(),
    //       mode: "insensitive",
    //     },
    //   },
    // });
    const scorecards = await this.prisma.scorecards.findMany({
      where: {
        ...(round
          ? { round: round.trim() }   // ✅ use round if provided
          : year
            ? { year: Number(year) }  // ✅ else use year
            : {}),                    // no filter if both are missing
        name: {
          contains: category.trim(),
          mode: "insensitive",
        },
      },
    });

    // Extract the one(s) for the selected state
    const selectedState = scorecards.filter(item => item.state === state);

    // Extract all others
    const groupedStates = scorecards
      .filter(item => item.state !== state && item.state !== null && item.state !== undefined)
      .reduce((acc, curr) => {
        const stateKey = curr.state ?? 'UNKNOWN';
        if (!acc[stateKey]) {
          acc[stateKey] = [];
        }
        acc[stateKey].push(curr);
        return acc;
      }, {} as Record<string, typeof scorecards>);

    return {
      data: {
        selected_state: selectedState,
        all_states: groupedStates,
      },
    };
  }

}
