import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthFacilityDto } from './create-health-facility.dto';

export class UpdateHealthFacilityDto extends PartialType(
  CreateHealthFacilityDto,
) {}
