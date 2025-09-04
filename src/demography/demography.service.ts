import { Injectable } from '@nestjs/common';
import { CreateDemographyDto } from './dto/create-demography.dto';
import { UpdateDemographyDto } from './dto/update-demography.dto';

@Injectable()
export class DemographyService {
  create(createDemographyDto: CreateDemographyDto) {
    return 'This action adds a new demography';
  }

  findAll() {
    return `This action returns all demography`;
  }

  findOne(id: number) {
    return `This action returns a #${id} demography`;
  }

  update(id: number, updateDemographyDto: UpdateDemographyDto) {
    return `This action updates a #${id} demography`;
  }

  remove(id: number) {
    return `This action removes a #${id} demography`;
  }
}
