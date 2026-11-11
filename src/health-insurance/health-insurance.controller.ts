import { Controller, Get, Param } from '@nestjs/common';
import { HealthInsuranceService } from './health-insurance.service';

@Controller('health-insurance')
export class HealthInsuranceController {
  constructor(
    private readonly healthInsuranceService: HealthInsuranceService,
  ) {}

  @Get(':state/:year')
  getHealthInsuranceData(
    @Param('state') state: string,
    @Param('year') year: string,
  ) {
    return this.healthInsuranceService.getHealthInsuranceData(state, year);
  }

  @Get('zonal/:zone/:state/:year')
  getZonalHealthInsuranceData(
    @Param('zone') zone: string,
    @Param('state') state: string,
    @Param('year') year: string,
  ) {
    return this.healthInsuranceService.getZonalHealthInsuranceData(
      zone,
      year,
      state,
    );
  }

  @Get('zonal/:zone/:state')
  getZonalHealthInsuranceDataWithoutYear(
    @Param('zone') zone: string,
    @Param('state') state: string,
  ) {
    return this.healthInsuranceService.getZonalHealthInsuranceData(
      zone,
      undefined,
      state,
    );
  }
}

