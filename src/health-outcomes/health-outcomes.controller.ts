import { Controller, Get, Param, Query } from '@nestjs/common';
import { HealthOutcomesService } from './health-outcomes.service';

@Controller('health-outcomes')
export class HealthOutcomesController {
  constructor(private readonly healthOutcomesService: HealthOutcomesService) {}

  @Get(':state/:year')
  getHealthOutcomesData(
    @Param('state') state: string,
    @Param('year') year: string,
  ) {
    return this.healthOutcomesService.getHealthOutcomesData(state, year);
  }

  @Get('zonal/:zone/:state/:year')
  getZonalHealthOutcomesData(
    @Param('zone') zone: string,
    @Param('state') state: string,
    @Param('year') year: string,
    @Query('indicator') indicator?: string,
  ) {
    return this.healthOutcomesService.getZonalHealthOutcomesData(
      zone,
      state,
      year,
      indicator,
    );
  }

  @Get('zonal/:zone/:state')
  getZonalHealthOutcomesDataWithoutYear(
    @Param('zone') zone: string,
    @Param('state') state: string,
    @Query('indicator') indicator?: string,
  ) {
    return this.healthOutcomesService.getZonalHealthOutcomesData(
      zone,
      state,
      undefined,
      indicator,
    );
  }
}
