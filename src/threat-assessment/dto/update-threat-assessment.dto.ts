import { PartialType } from '@nestjs/mapped-types';
import { CreateThreatAssessmentDto } from './create-threat-assessment.dto';

export class UpdateThreatAssessmentDto extends PartialType(
  CreateThreatAssessmentDto,
) {}

