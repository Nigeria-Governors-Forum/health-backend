import { Injectable } from '@nestjs/common';
import { CreateZonalHealthFinanceDto } from './dto/create-zonal-health-finance.dto';
import { UpdateZonalHealthFinanceDto } from './dto/update-zonal-health-finance.dto';

@Injectable()
export class ZonalHealthFinanceService {
  create(createZonalHealthFinanceDto: CreateZonalHealthFinanceDto) {
    return 'This action adds a new zonalHealthFinance';
  }

  findAll() {
    return `This action returns all zonalHealthFinance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} zonalHealthFinance`;
  }

  update(id: number, updateZonalHealthFinanceDto: UpdateZonalHealthFinanceDto) {
    return `This action updates a #${id} zonalHealthFinance`;
  }

  remove(id: number) {
    return `This action removes a #${id} zonalHealthFinance`;
  }
}
