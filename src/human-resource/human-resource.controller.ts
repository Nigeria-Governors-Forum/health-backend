import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { HumanResourceService } from './human-resource.service';
import { CreateHumanResourceDto } from './dto/create-human-resource.dto';
import { UpdateHumanResourceDto } from './dto/update-human-resource.dto';

@Controller('human-resource')
export class HumanResourceController {
  constructor(private readonly humanResourceService: HumanResourceService) {}

  @Post()
  create(@Body() createHumanResourceDto: CreateHumanResourceDto) {
    return this.humanResourceService.create(createHumanResourceDto);
  }

  @Get()
  findAll() {
    return this.humanResourceService.findAll();
  }

  @Get('zonal')
  getAllZonalHumanResourceData(@Query('year') year?: string) {
    return this.humanResourceService.getZonalHumanResourceData(year);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.humanResourceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHumanResourceDto: UpdateHumanResourceDto,
  ) {
    return this.humanResourceService.update(+id, updateHumanResourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.humanResourceService.remove(+id);
  }

  @Get(':state/:year')
  getDashboardData(@Param('state') state: string, @Param('year') year: string) {
    return this.humanResourceService.getHumanResourceData(state, year);
  }

  @Get('zonal/:zone/:state/:year')
  getZonalHumanResourceData(
    @Param('year') year: string,
    @Param('state') state: string,
  ) {
    return this.humanResourceService.getZonalHumanResourceData(year, state);
  }
}
