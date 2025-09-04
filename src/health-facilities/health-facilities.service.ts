import { Injectable } from '@nestjs/common';
import { CreateHealthFacilityDto } from './dto/create-health-facility.dto';
import { UpdateHealthFacilityDto } from './dto/update-health-facility.dto';

@Injectable()
export class HealthFacilitiesService {
  create(createHealthFacilityDto: CreateHealthFacilityDto) {
    return 'This action adds a new healthFacility';
  }

  findAll() {
    return `This action returns all healthFacilities`;
  }

  findOne(id: number) {
    return `This action returns a #${id} healthFacility`;
  }

  update(id: number, updateHealthFacilityDto: UpdateHealthFacilityDto) {
    return `This action updates a #${id} healthFacility`;
  }

  remove(id: number) {
    return `This action removes a #${id} healthFacility`;
  }
}
