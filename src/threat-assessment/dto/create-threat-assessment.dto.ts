import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateThreatAssessmentDto {
  @IsOptional()
  @IsString()
  zone?: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  page?: string;

  @IsString()
  risk: string;

  @IsString()
  primary_threats: string;

  @IsOptional()
  @IsString()
  hotspots_lga?: string;
}

export class CreateThreatLgaDto {
  @IsOptional()
  @IsString()
  zone?: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  page?: string;

  @IsString()
  lga: string;

  @IsString()
  risk: string;

  @IsString()
  primary_threats: string;
}

