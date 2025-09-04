import { PartialType } from '@nestjs/mapped-types';
import { CreateDemographyDto } from './create-demography.dto';

export class UpdateDemographyDto extends PartialType(CreateDemographyDto) {}
