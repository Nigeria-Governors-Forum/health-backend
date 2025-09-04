import { Injectable } from '@nestjs/common';
import { CreateZonalHealthFacilityDto } from './dto/create-zonal-health-facility.dto';
import { UpdateZonalHealthFacilityDto } from './dto/update-zonal-health-facility.dto';

@Injectable()
export class ZonalHealthFacilitiesService {
  create(createZonalHealthFacilityDto: CreateZonalHealthFacilityDto) {
    return 'This action adds a new zonalHealthFacility';
  }

  findAll() {
    return `This action returns all zonalHealthFacilities`;
  }

  findOne(id: number) {
    return `This action returns a #${id} zonalHealthFacility`;
  }

  update(id: number, updateZonalHealthFacilityDto: UpdateZonalHealthFacilityDto) {
    return `This action updates a #${id} zonalHealthFacility`;
  }

  remove(id: number) {
    return `This action removes a #${id} zonalHealthFacility`;
  }
}
