import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZonalHealthFacilitiesService } from './zonal-health-facilities.service';
import { CreateZonalHealthFacilityDto } from './dto/create-zonal-health-facility.dto';
import { UpdateZonalHealthFacilityDto } from './dto/update-zonal-health-facility.dto';

@Controller('zonal-health-facilities')
export class ZonalHealthFacilitiesController {
  constructor(private readonly zonalHealthFacilitiesService: ZonalHealthFacilitiesService) {}

  @Post()
  create(@Body() createZonalHealthFacilityDto: CreateZonalHealthFacilityDto) {
    return this.zonalHealthFacilitiesService.create(createZonalHealthFacilityDto);
  }

  @Get()
  findAll() {
    return this.zonalHealthFacilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonalHealthFacilitiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZonalHealthFacilityDto: UpdateZonalHealthFacilityDto) {
    return this.zonalHealthFacilitiesService.update(+id, updateZonalHealthFacilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonalHealthFacilitiesService.remove(+id);
  }
}
