import { Module } from '@nestjs/common';
import { ZonalHealthFacilitiesService } from './zonal-health-facilities.service';
import { ZonalHealthFacilitiesController } from './zonal-health-facilities.controller';

@Module({
  controllers: [ZonalHealthFacilitiesController],
  providers: [ZonalHealthFacilitiesService],
})
export class ZonalHealthFacilitiesModule {}
