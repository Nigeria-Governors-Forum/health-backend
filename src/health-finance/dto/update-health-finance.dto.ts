import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthFinanceDto } from './create-health-finance.dto';

export class UpdateHealthFinanceDto extends PartialType(CreateHealthFinanceDto) {}
