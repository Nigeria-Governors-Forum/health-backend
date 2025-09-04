import { Module } from '@nestjs/common';
import { DemographyService } from './demography.service';
import { DemographyController } from './demography.controller';

@Module({
  controllers: [DemographyController],
  providers: [DemographyService],
})
export class DemographyModule {}
