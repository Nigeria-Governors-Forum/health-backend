import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as XLSX from 'xlsx';
import { ThreatAssessmentService } from './threat-assessment.service';
import { CreateThreatAssessmentDto } from './dto/create-threat-assessment.dto';
import { UpdateThreatAssessmentDto } from './dto/update-threat-assessment.dto';
import { UserService } from 'src/user/user.service';

@Controller('threat-assessment')
export class ThreatAssessmentController {
  constructor(
    private readonly threatAssessmentService: ThreatAssessmentService,
    private readonly userService: UserService,
  ) {}

  @Post()
  create(@Body() createThreatAssessmentDto: CreateThreatAssessmentDto) {
    return this.threatAssessmentService.create(createThreatAssessmentDto);
  }

  @Post('seed')
  seed(@Query('year') year?: string) {
    return this.threatAssessmentService.seed(year ? Number(year) : 2026);
  }

  @Post('upload/:year')
  @UseInterceptors(FileInterceptor('file'))
  async uploadWorkbook(
    @Param('year', ParseIntPipe) year: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('Year must be between 2000 and 2100');
    }
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }
    if (!/\.(xlsx|xls|xlsb)$/i.test(file.originalname)) {
      throw new BadRequestException(
        'Only Excel files (.xlsx, .xls, .xlsb) are allowed',
      );
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const securitySheetNames = workbook.SheetNames.filter((sheetName) =>
      [
        'threatvulnerabilityassessment',
        'threatassessment',
        'threatvulnerability',
        'threat',
      ].includes(sheetName.toLowerCase().replace(/[^a-z]/g, '')),
    );
    if (securitySheetNames.length === 0) {
      throw new BadRequestException(
        'Workbook must contain a Threat_Vulnerability_Assessment sheet',
      );
    }

    const securityWorkbook: XLSX.WorkBook = {
      ...workbook,
      SheetNames: securitySheetNames,
      Sheets: Object.fromEntries(
        securitySheetNames.map((sheetName) => [
          sheetName,
          workbook.Sheets[sheetName],
        ]),
      ),
    };
    const result = await this.userService.uploadFromWorkbook(
      securityWorkbook,
      year,
    );
    const reports = result.sheetReports ?? [];
    const failedReports = reports.filter(
      (report) => report.status === 'FAILED' || report.status === 'SKIPPED',
    );
    if (failedReports.length > 0) {
      throw new BadRequestException({
        message: 'Security data upload failed',
        reports: failedReports,
      });
    }

    return {
      message: 'Security data uploaded successfully',
      year,
      reports,
    };
  }

  @Get()
  findAll(
    @Query('zone') zone?: string,
    @Query('risk') risk?: string,
    @Query('year') year?: string,
  ) {
    return this.threatAssessmentService.findAll({
      zone,
      risk,
      year: year ? Number(year) : undefined,
    });
  }

  @Get('summary')
  getSummary() {
    return this.threatAssessmentService.getSummary();
  }

  @Get('lgas')
  findAllLgas(
    @Query('zone') zone?: string,
    @Query('state') state?: string,
    @Query('risk') risk?: string,
  ) {
    return this.threatAssessmentService.findAllLgas({ zone, state, risk });
  }

  @Get('lga/:lga')
  findByLga(@Param('lga') lga: string) {
    return this.threatAssessmentService.findByLga(lga);
  }

  @Get('zone/:zone')
  findByZone(
    @Param('zone') zone: string,
    @Query('year') year?: string,
  ) {
    return this.threatAssessmentService.findByZone(
      zone,
      year ? Number(year) : undefined,
    );
  }

  @Get('risk/:risk')
  findByRisk(
    @Param('risk') risk: string,
    @Query('year') year?: string,
  ) {
    return this.threatAssessmentService.findByRisk(
      risk,
      year ? Number(year) : undefined,
    );
  }

  @Get('state/:state')
  findByState(
    @Param('state') state: string,
    @Query('year') year?: string,
  ) {
    return this.threatAssessmentService.findByState(
      state,
      year ? Number(year) : undefined,
    );
  }

  @Get(':state/:year')
  getByStateAndYear(
    @Param('state') state: string,
    @Param('year') year: string,
  ) {
    return this.threatAssessmentService.findByState(state, Number(year));
  }

  @Get(':state')
  getByState(
    @Param('state') state: string,
    @Query('year') year?: string,
  ) {
    return this.threatAssessmentService.findByState(
      state,
      year ? Number(year) : undefined,
    );
  }

  @Get('id/:id')
  findOne(@Param('id') id: string) {
    return this.threatAssessmentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateThreatAssessmentDto: UpdateThreatAssessmentDto,
  ) {
    return this.threatAssessmentService.update(+id, updateThreatAssessmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.threatAssessmentService.remove(+id);
  }
}
