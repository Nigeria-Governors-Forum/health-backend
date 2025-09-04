import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZonalHealthFinanceService } from './zonal-health-finance.service';
import { CreateZonalHealthFinanceDto } from './dto/create-zonal-health-finance.dto';
import { UpdateZonalHealthFinanceDto } from './dto/update-zonal-health-finance.dto';

@Controller('zonal-health-finance')
export class ZonalHealthFinanceController {
  constructor(private readonly zonalHealthFinanceService: ZonalHealthFinanceService) {}

  @Post()
  create(@Body() createZonalHealthFinanceDto: CreateZonalHealthFinanceDto) {
    return this.zonalHealthFinanceService.create(createZonalHealthFinanceDto);
  }

  @Get()
  findAll() {
    return this.zonalHealthFinanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonalHealthFinanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZonalHealthFinanceDto: UpdateZonalHealthFinanceDto) {
    return this.zonalHealthFinanceService.update(+id, updateZonalHealthFinanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonalHealthFinanceService.remove(+id);
  }
}
