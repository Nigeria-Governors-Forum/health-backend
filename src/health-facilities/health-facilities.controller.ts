import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthFacilitiesService } from './health-facilities.service';
import { CreateHealthFacilityDto } from './dto/create-health-facility.dto';
import { UpdateHealthFacilityDto } from './dto/update-health-facility.dto';

@Controller('health-facilities')
export class HealthFacilitiesController {
  constructor(private readonly healthFacilitiesService: HealthFacilitiesService) { }

  @Post()
  create(@Body() createHealthFacilityDto: CreateHealthFacilityDto) {
    return this.healthFacilitiesService.create(createHealthFacilityDto);
  }

  @Get()
  findAll() {
    return this.healthFacilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthFacilitiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHealthFacilityDto: UpdateHealthFacilityDto) {
    return this.healthFacilitiesService.update(+id, updateHealthFacilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthFacilitiesService.remove(+id);
  }

  @Get(':state/:year')
  getHealthFacilityData(@Param('state') state: string, @Param('year') year: string) {
    return this.healthFacilitiesService.getHealthFacilityData(state, year);
  }

  @Get('zonal/:zone/:state/:year')
  getZonalHealthFacilityData(@Param('zone') zone: string, @Param('state') state: string, @Param('year') year: string) {
    return this.healthFacilitiesService.getZonalHealthFacilityData(zone, year);
  }
}
