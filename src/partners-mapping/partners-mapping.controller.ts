import { Controller, Get, Param } from '@nestjs/common';
import { PartnersMappingService } from './partners-mapping.service';

@Controller('partners-mapping')
export class PartnersMappingController {
  constructor(
    private readonly partnersMappingService: PartnersMappingService,
  ) {}

  @Get(':state/:year')
  getPartnersMappingData(
    @Param('state') state: string,
    @Param('year') year: string,
  ) {
    return this.partnersMappingService.getPartnersMappingData(state, year);
  }

  @Get('zonal/:zone/:state/:year')
  getZonalPartnersMappingData(
    @Param('zone') zone: string,
    @Param('state') state: string,
    @Param('year') year: string,
  ) {
    return this.partnersMappingService.getZonalPartnersMappingData(
      zone,
      year,
      state,
    );
  }

  @Get('zonal/:zone/:state')
  getZonalPartnersMappingDataWithoutYear(
    @Param('zone') zone: string,
    @Param('state') state: string,
  ) {
    return this.partnersMappingService.getZonalPartnersMappingData(
      zone,
      undefined,
      state,
    );
  }
}
