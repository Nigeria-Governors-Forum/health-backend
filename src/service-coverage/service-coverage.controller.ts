import { Controller, Get, Param, Query } from '@nestjs/common';
import { ServiceCoverageService } from './service-coverage.service';

@Controller('service-coverage')
export class ServiceCoverageController {
  constructor(private readonly serviceCoverageService: ServiceCoverageService) {}

  @Get(':state/:year')
  getServiceCoverageData(
    @Param('state') state: string,
    @Param('year') year: string,
  ) {
    return this.serviceCoverageService.getServiceCoverageData(state, Number(year));
  }

  @Get('zonal/:zone/:state/:year')
  getZonalServiceCoverage(
    @Param('zone') zone: string,
    @Param('state') state: string,
    @Param('year') year: string,
    @Query('indicator') indicator: string,
  ) {
    return this.serviceCoverageService.getZonalServiceCoverage(
      zone,
      state,
      Number(year),
      indicator,
    );
  }
}
