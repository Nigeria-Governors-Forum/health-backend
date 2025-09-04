import { Module } from '@nestjs/common';
import { ZonalHealthFinanceService } from './zonal-health-finance.service';
import { ZonalHealthFinanceController } from './zonal-health-finance.controller';

@Module({
  controllers: [ZonalHealthFinanceController],
  providers: [ZonalHealthFinanceService],
})
export class ZonalHealthFinanceModule {}
