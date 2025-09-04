import { Module } from '@nestjs/common';
import { HealthFacilitiesService } from './health-facilities.service';
import { HealthFacilitiesController } from './health-facilities.controller';

@Module({
  controllers: [HealthFacilitiesController],
  providers: [HealthFacilitiesService],
})
export class HealthFacilitiesModule {}
