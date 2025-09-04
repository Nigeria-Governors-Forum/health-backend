import { Module } from '@nestjs/common';
import { HealthFinanceService } from './health-finance.service';
import { HealthFinanceController } from './health-finance.controller';

@Module({
  controllers: [HealthFinanceController],
  providers: [HealthFinanceService],
})
export class HealthFinanceModule {}
