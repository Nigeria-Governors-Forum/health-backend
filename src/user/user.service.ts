import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as XLSX from 'xlsx';
import { Observable, Subject } from 'rxjs';

function parseNumericValue(val: any, isFloat = false): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : isFloat ? val : Math.round(val);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (
      !trimmed ||
      trimmed === '-' ||
      trimmed === 'N/A' ||
      trimmed.toLowerCase() === 'null' ||
      trimmed.toLowerCase() === 'no data'
    ) {
      return null;
    }
    const num = parseFloat(trimmed);
    return isNaN(num) ? null : isFloat ? num : Math.round(num);
  }
  return null;
}

function getPrismaModel(prisma: any, name: string): any {
  const norm = name.trim().replace(/\s+/g, '_').toLowerCase();
  if (norm === 'demography_lga') {
    return prisma.demography_LGA;
  }
  if (norm === 'hfcilities' || norm === 'health_facilities') {
    return prisma.health_Facilities;
  }
  if (
    norm === 'hfcilities_service_provision' ||
    norm === 'health_fac_service_provision' ||
    norm === 'health_facilities_service_provision'
  ) {
    return prisma.health_Fac_Service_Provision;
  }
  if (norm === 'hrh' || norm === 'health_training_institutions') {
    return prisma.health_Training_Institutions;
  }
  const proto = Object.getPrototypeOf(prisma);
  const keys = [...Object.keys(prisma), ...Object.getOwnPropertyNames(proto)];
  for (const k of keys) {
    if (k.toLowerCase() === norm) return prisma[k];
  }
  return prisma[norm] || prisma[name];
}

function parseYearCreated(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    if (val > 10000) {
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.getFullYear();
    }
    return val;
  }
  const str = String(val).trim();
  const match = str.match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    return parseInt(match[1], 10);
  }
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

function excelDateToYear(excelDate: number): number {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.getFullYear();
}
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  private progress$ = new Subject<{ message: string; percent: number }>();

  private uniqueKeys: Record<string, string[]> = {
    Demography: ['state', 'year', 'indicator', 'category_1', 'category_2'],
    Demography_LGA: ['state', 'lga', 'year'],
    Access_Service_Utilization: ['state', 'year', 'indicator'],
    HFin: ['state', 'year', 'indicator', 'exp_type', 'status'],
    HFin_2: ['state', 'year', 'indicator', 'exp_type', 'status'],
    LGA_Fin: ['state', 'lga', 'year', 'indicator', 'exp_type', 'status'],
    LGA_PCap: ['state', 'lga', 'year'],
    Scorecards: ['state', 'name', 'year', 'indicator'],
    Partners_Mapping: [
      'state',
      'year',
      'partner',
      'intervention_group_correct',
    ],
    HFcilities: ['state', 'year', 'indicator', 'level', 'ownership'],
    Health_Facilities: ['state', 'year', 'indicator', 'level', 'ownership'],
    HFcilities_Service_Provision: ['state', 'year', 'service_provision'],
    Health_Fac_Service_Provision: ['state', 'year', 'service_provision'],
    Health_Facilities_Service_Provision: ['state', 'year', 'service_provision'],
    HRH: ['state', 'year', 'institution', 'ownership'],
    Health_Training_Institutions: ['state', 'year', 'institution', 'ownership'],
    Insurance_Coverage: ['state', 'year', 'name', 'indicator'],
    Health_Outcomes: ['state', 'year', 'indicator'],
    NDHS: ['state', 'year', 'category', 'indicator'],
    Per_Capita: ['state', 'year'],

    Admission_Quota: ['state', 'year', 'school', 'faculty'],
    Flagship_Project: ['state', 'year', 'project'], // only one per state/year
    Presidential_Indicators: ['state', 'year', 'indicator'], // only one per state/year
    LGA_Population: ['state', 'year', 'lga'], // only one per state/year
  };

  async findAll() {
    const users = await this.prisma.user.findMany();
    return { users: users.map(({ password, ...rest }) => rest) };
  }

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }
    return this.prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id: Number(id) },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return { message: 'Password reset successfully' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found with email');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      state: user.state,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async uploadFromWorkbook(workbook: XLSX.WorkBook) {
    const totalSheets = workbook.SheetNames.length;
    let processedSheets = 0;
    const sheetReports: Array<{
      sheetName: string;
      canonicalKey: string;
      status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'SKIPPED';
      totalRows: number;
      createdRows: number;
      updatedRows: number;
      skippedRows: number;
      issues: string[];
    }> = [];

    for (const sheetName of workbook.SheetNames) {
      processedSheets++;
      const percent = Math.round((processedSheets / totalSheets) * 100);

      this.progress$.next({
        message: `📂 Processing ${sheetName} out of ${totalSheets} ...`,
        percent,
      });

      const sheetData = XLSX.utils.sheet_to_json<Record<string, any>>(
        workbook.Sheets[sheetName],
      );

      let canonicalSheetKey = sheetName.trim().replace(/\s+/g, '_');
      const normLower = canonicalSheetKey.toLowerCase();
      if (normLower === 'demography_lga') canonicalSheetKey = 'Demography_LGA';
      else if (normLower === 'hfcilities' || normLower === 'health_facilities')
        canonicalSheetKey = 'Health_Facilities';
      else if (
        normLower === 'hfcilities_service_provision' ||
        normLower === 'health_fac_service_provision' ||
        normLower === 'health_facilities_service_provision'
      )
        canonicalSheetKey = 'Health_Fac_Service_Provision';
      else if (
        normLower === 'hrh' ||
        normLower === 'health_training_institutions'
      )
        canonicalSheetKey = 'Health_Training_Institutions';

      if (!sheetData.length) {
        sheetReports.push({
          sheetName,
          canonicalKey: canonicalSheetKey,
          status: 'SKIPPED',
          totalRows: 0,
          createdRows: 0,
          updatedRows: 0,
          skippedRows: 0,
          issues: ['Sheet is empty'],
        });
        continue;
      }

      const prismaModel = getPrismaModel(this.prisma, canonicalSheetKey);
      if (!prismaModel) {
        console.warn(`⚠️ Skipping ${sheetName} — not found in Prisma client`);
        sheetReports.push({
          sheetName,
          canonicalKey: canonicalSheetKey,
          status: 'SKIPPED',
          totalRows: sheetData.length,
          createdRows: 0,
          updatedRows: 0,
          skippedRows: sheetData.length,
          issues: [`No matching Prisma database model found for sheet: ${sheetName}`],
        });
        continue;
      }

      console.log(`📂 Processing ${sheetName} (${canonicalSheetKey}) ...`);

      const modelFields = (Prisma as any).dmmf?.datamodel?.models?.find(
        (m: any) => m.name.toLowerCase() === canonicalSheetKey.toLowerCase(),
      )?.fields.map((f: any) => f.name);
      const validFieldsSet = modelFields ? new Set(modelFields) : null;

      let successCount = 0;
      let skippedCount = 0;
      const issues: string[] = [];

      try {
        const uniqueFields =
          this.uniqueKeys[canonicalSheetKey] || this.uniqueKeys[sheetName];
        if (!uniqueFields) {
          throw new Error(`No unique keys defined for sheet: ${sheetName}`);
        }

        // 1. Fetch existing records to build in-memory lookup map
        const existingRecords = await prismaModel.findMany();
        const existingMap = new Map<string, any>();
        for (const rec of existingRecords) {
          const compositeKey = uniqueFields
            .map((f) =>
              String(rec[f] ?? '')
                .toLowerCase()
                .trim(),
            )
            .join('|');
          existingMap.set(compositeKey, rec);
        }

        const toCreate: any[] = [];
        const toUpdate: { where: any; data: any }[] = [];

        // 2. Process rows in-memory
        for (const row of sheetData) {
          const sanitized: Record<string, any> = {};
          for (const key of Object.keys(row)) {
            let fieldName = key.replace(/\s+/g, '_').toLowerCase();
            let value = row[key];

            // Normalize state strings
            if (fieldName === 'state' && value !== undefined && value !== null) {
              value = String(value).trim();
              if (
                value === 'FCT-Abuja' ||
                value === 'Federal Capital Territory'
              ) {
                value = 'FCT';
              }
            }

            // Normalize year numbers
            if (fieldName === 'year' && value !== undefined && value !== null) {
              const parsedYr = parseInt(String(value), 10);
              value = isNaN(parsedYr) ? null : parsedYr;
            }

            // Date handling
            if (fieldName === 'period' && value) {
              sanitized.year = excelDateToYear(value);
              continue;
            }

            // Parse numeric fields safely for integers and floats across all models
            if (
              fieldName === 'lga_population' ||
              fieldName === 'number_of_wards' ||
              fieldName === 'health_facilities' ||
              fieldName === 'value' ||
              fieldName === 'number' ||
              fieldName === 'percentage'
            ) {
              const ind = row['Indicator'] || row['indicator'];
              if (ind === 'Year Created') {
                value = parseYearCreated(value);
              } else {
                const isFloat =
                  fieldName === 'lga_population' || fieldName === 'percentage';
                value = parseNumericValue(value, isFloat);
              }
            }

            // Map section column to page field
            if (fieldName === 'section') fieldName = 'page';

            // Map Demography_LGA column variants
            if (canonicalSheetKey === 'Demography_LGA') {
              if (
                fieldName === 'hard_to_reach_colour' ||
                fieldName === 'hard_to_reach_lga' ||
                fieldName === 'hard_to_reach'
              ) {
                fieldName = 'hard_to_reach_wards';
              }
            }

            // Map Health_Fac_Service_Provision fallback when indicator is placed in Page column
            if (canonicalSheetKey === 'Health_Fac_Service_Provision') {
              if (!sanitized.service_provision && (row['Page'] || row['page'] || row['Section'] || row['section'])) {
                sanitized.service_provision = String(row['Page'] || row['page'] || row['Section'] || row['section']).trim();
              }
            }

            // Map Health_Training_Institutions indicator column to institution
            if (canonicalSheetKey === 'Health_Training_Institutions') {
              if (
                !sanitized.institution &&
                (row['Indicator'] || row['indicator'] || row['Institution'] || row['institution'])
              ) {
                sanitized.institution = String(
                  row['Indicator'] || row['indicator'] || row['Institution'] || row['institution']
                ).trim();
              }
            }

            // Map LGA_Population mixed-case schema columns
            if (sheetName === 'LGA_Population') {
              if (fieldName === 'hard_to_reach_wards')
                fieldName = 'hard_To_Reach_Wards';
              if (fieldName === 'hard_to_reach') fieldName = 'hard_To_Reach';
              if (fieldName === 'health_facilities')
                fieldName = 'health_Facilities';
            }

            sanitized[fieldName] = value;
          }

          if (validFieldsSet) {
            for (const key of Object.keys(sanitized)) {
              if (!validFieldsSet.has(key)) {
                delete sanitized[key];
              }
            }
          }

          if (
            sanitized.year === null ||
            sanitized.year === undefined ||
            isNaN(sanitized.year) ||
            sanitized.year < 1900 ||
            sanitized.year > 2100
          ) {
            skippedCount++;
            continue;
          }

          const compositeKey = uniqueFields
            .map((f) =>
              String(sanitized[f] ?? '')
                .toLowerCase()
                .trim(),
            )
            .join('|');
          const existing = existingMap.get(compositeKey);

          if (!existing) {
            toCreate.push(sanitized);
          } else {
            // Compare properties safely (ignoring empty vs null mismatches)
            const isSame = Object.keys(sanitized).every((key) => {
              const sVal = sanitized[key];
              const eVal = existing[key];
              if (
                (sVal === undefined || sVal === null || sVal === '') &&
                (eVal === undefined || eVal === null || eVal === '')
              ) {
                return true;
              }
              return String(sVal ?? '').trim() === String(eVal ?? '').trim();
            });

            if (!isSame) {
              toUpdate.push({ where: { id: existing.id }, data: sanitized });
            }
          }
          successCount++;
        }

        // 3. Batch insert new entries
        if (toCreate.length > 0) {
          await prismaModel.createMany({ data: toCreate });
          console.log(`   ➡️ Bulk created ${toCreate.length} rows`);
        }

        // 4. Batch update modified entries safely in chunks of 10
        if (toUpdate.length > 0) {
          const chunkSize = 10;
          for (let i = 0; i < toUpdate.length; i += chunkSize) {
            const chunk = toUpdate.slice(i, i + chunkSize);
            await Promise.all(
              chunk.map((item) =>
                prismaModel.update({
                  where: item.where,
                  data: item.data,
                }),
              ),
            );
          }
          console.log(`   ➡️ Bulk updated ${toUpdate.length} rows`);
        }

        if (skippedCount > 0) {
          issues.push(`${skippedCount} rows skipped due to invalid/missing year`);
        }

        console.log(`✅ ${sheetName}: ${successCount} rows processed`);
        sheetReports.push({
          sheetName,
          canonicalKey: canonicalSheetKey,
          status: issues.length > 0 ? 'WARNING' : 'SUCCESS',
          totalRows: sheetData.length,
          createdRows: toCreate.length,
          updatedRows: toUpdate.length,
          skippedRows: skippedCount,
          issues,
        });
      } catch (err: any) {
        console.error(`❌ Error processing ${sheetName}: ${err.message}`);
        issues.push(`Error: ${err.message}`);
        sheetReports.push({
          sheetName,
          canonicalKey: canonicalSheetKey,
          status: 'FAILED',
          totalRows: sheetData.length,
          createdRows: 0,
          updatedRows: 0,
          skippedRows: sheetData.length,
          issues,
        });
        this.progress$.next({
          message: `❌ Upload issue in ${sheetName}: ${err.message}`,
          percent,
        });
      }
    }

    this.progress$.next({
      message: `✅ Upload completed successfully`,
      percent: 100,
    });

    this.progress$.complete();

    return {
      success: true,
      message: 'Upload completed successfully',
      sheetReports,
    };
  }

  getProgressStream(): Observable<{ message: string; percent: number }> {
    return this.progress$.asObservable();
  }
}
