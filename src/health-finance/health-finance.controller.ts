import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthFinanceService } from './health-finance.service';
import { CreateHealthFinanceDto } from './dto/create-health-finance.dto';
import { UpdateHealthFinanceDto } from './dto/update-health-finance.dto';

@Controller('health-finance')
export class HealthFinanceController {
  constructor(private readonly healthFinanceService: HealthFinanceService) { }

  @Post()
  create(@Body() createHealthFinanceDto: CreateHealthFinanceDto) {
    return this.healthFinanceService.create(createHealthFinanceDto);
  }

  @Get()
  findAll() {
    return this.healthFinanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthFinanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHealthFinanceDto: UpdateHealthFinanceDto) {
    return this.healthFinanceService.update(+id, updateHealthFinanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthFinanceService.remove(+id);
  }

  @Get(':state/:year')
  getHealthFinanceData(@Param('state') state: string, @Param('year') year: string) {
    return this.healthFinanceService.getHealthFinanceData(state, year);
  }

  @Get('zonal/:zone/:state/:year')
  getZonalHealthFinance(@Param('zone') zone: string, @Param('state') state: string, @Param('year') year: string) {
    return this.healthFinanceService.getZonalHealthFinanceData(zone, year);
  }
}
