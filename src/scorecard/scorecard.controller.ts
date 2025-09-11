import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScorecardService } from './scorecard.service';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';

@Controller('scorecard')
export class ScorecardController {
  constructor(private readonly scorecardService: ScorecardService) { }

  @Post()
  create(@Body() createScorecardDto: CreateScorecardDto) {
    return this.scorecardService.create(createScorecardDto);
  }

  @Get()
  findAll() {
    return this.scorecardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scorecardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScorecardDto: UpdateScorecardDto) {
    return this.scorecardService.update(+id, updateScorecardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scorecardService.remove(+id);
  }

  @Get(':state/:year/:category')
  getScorecard(
    @Param('state') state: string,
    @Param('year') year: string,
    @Param('category') category: string,
    @Param('round') round?: string,) {
    return this.scorecardService.getScorecardData(state, year, category, round);
  }
  @Get(':state/:year/:category/:round')
  getScorecardRound(
    @Param('state') state: string,
    @Param('year') year: string,
    @Param('category') category: string,
    @Param('round') round?: string,) {
    return this.scorecardService.getScorecardData(state, year, category, round);
  }
}
