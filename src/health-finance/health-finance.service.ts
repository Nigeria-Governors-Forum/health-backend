import { Injectable } from '@nestjs/common';
import { CreateHealthFinanceDto } from './dto/create-health-finance.dto';
import { UpdateHealthFinanceDto } from './dto/update-health-finance.dto';

@Injectable()
export class HealthFinanceService {
  create(createHealthFinanceDto: CreateHealthFinanceDto) {
    return 'This action adds a new healthFinance';
  }

  findAll() {
    return `This action returns all healthFinance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} healthFinance`;
  }

  update(id: number, updateHealthFinanceDto: UpdateHealthFinanceDto) {
    return `This action updates a #${id} healthFinance`;
  }

  remove(id: number) {
    return `This action removes a #${id} healthFinance`;
  }
}
