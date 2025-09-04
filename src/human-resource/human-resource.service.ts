import { Injectable } from '@nestjs/common';
import { CreateHumanResourceDto } from './dto/create-human-resource.dto';
import { UpdateHumanResourceDto } from './dto/update-human-resource.dto';

@Injectable()
export class HumanResourceService {
  create(createHumanResourceDto: CreateHumanResourceDto) {
    return 'This action adds a new humanResource';
  }

  findAll() {
    return `This action returns all humanResource`;
  }

  findOne(id: number) {
    return `This action returns a #${id} humanResource`;
  }

  update(id: number, updateHumanResourceDto: UpdateHumanResourceDto) {
    return `This action updates a #${id} humanResource`;
  }

  remove(id: number) {
    return `This action removes a #${id} humanResource`;
  }
}
