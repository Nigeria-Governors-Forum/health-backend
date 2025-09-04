import { PartialType } from '@nestjs/mapped-types';
import { CreateZonalHealthFinanceDto } from './create-zonal-health-finance.dto';

export class UpdateZonalHealthFinanceDto extends PartialType(CreateZonalHealthFinanceDto) {}
