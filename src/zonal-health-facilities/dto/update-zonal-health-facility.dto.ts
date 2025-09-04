import { PartialType } from '@nestjs/mapped-types';
import { CreateZonalHealthFacilityDto } from './create-zonal-health-facility.dto';

export class UpdateZonalHealthFacilityDto extends PartialType(CreateZonalHealthFacilityDto) {}
