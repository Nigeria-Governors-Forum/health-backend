import { Injectable } from '@nestjs/common';
import { CreateScorecardDto } from './dto/create-scorecard.dto';
import { UpdateScorecardDto } from './dto/update-scorecard.dto';

@Injectable()
export class ScorecardService {
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
}
