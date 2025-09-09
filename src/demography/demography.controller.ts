import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DemographyService } from './demography.service';
import { CreateDemographyDto } from './dto/create-demography.dto';
import { UpdateDemographyDto } from './dto/update-demography.dto';

@Controller('demography')
export class DemographyController {
  constructor(private readonly demographyService: DemographyService) { }

  @Post()
  create(@Body() createDemographyDto: CreateDemographyDto) {
    return this.demographyService.create(createDemographyDto);
  }

  @Get()
  findAll() {
    return this.demographyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demographyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDemographyDto: UpdateDemographyDto) {
    return this.demographyService.update(+id, updateDemographyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demographyService.remove(+id);
  }

  @Get(':state/:year')
  getDemographyData(@Param('state') state: string, @Param('year') year: string) {
    console.log(state, year);
    return this.demographyService.getDemographyData(state, year);
  }
}
