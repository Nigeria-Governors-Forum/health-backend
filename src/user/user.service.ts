import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as XLSX from 'xlsx';
import { Observable, Subject } from 'rxjs';

function excelDateToYear(excelDate: number): number {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.getFullYear();
}
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private progress$ = new Subject<{ message: string; percent: number }>();

  private uniqueKeys: Record<string, string[]> = {
    Demography: ['state', 'year', 'indicator'],
    Demography_LGA: ['state', 'lga', 'year'],
    Access_Service_Utilization: ['state', 'year', 'indicator'],
    HFin_1: ['state', 'year', 'indicator', 'exp_type', 'status'],
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
    HFcilities_Service_Provision: ['state', 'year', 'service_provision'],
    HRH: ['state', 'year', 'institution', 'ownership'],
    HRH_Professions: ['state', 'year', 'institution'],
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

    for (const sheetName of workbook.SheetNames) {
      processedSheets++;
      const percent = Math.round((processedSheets / totalSheets) * 100);

      // 👇 emit progress update
      this.progress$.next({
        message: `📂 Processing ${sheetName} out of ${totalSheets} ...`,
        percent,
      });

      const sheetData = XLSX.utils.sheet_to_json<Record<string, any>>(
        workbook.Sheets[sheetName],
      );
      if (!sheetData.length) continue;

      const modelName =
        sheetName.charAt(0).toLowerCase() +
        sheetName.slice(1).replace(/\s+/g, '_');

      const prismaModel = (this.prisma as any)[modelName];
      if (!prismaModel) {
        console.warn(`⚠️ Skipping ${sheetName} — not found in Prisma client`);
        continue;
      }

      console.log(`📂 Processing ${sheetName} ...`);

      let successCount = 0;

      try {
        const uniqueFields = this.uniqueKeys[sheetName];
        if (!uniqueFields) {
          throw new Error(`No unique keys defined for sheet: ${sheetName}`);
        }

        // 1. Fetch all existing records for this model to build in-memory lookup map
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
            const value = row[key];

            // Date handling
            if (fieldName === 'period' && value) {
              sanitized.year = excelDateToYear(value);
              continue;
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
            // Compare properties
            const isSame = Object.keys(sanitized).every(
              (key) => sanitized[key] === existing[key],
            );

            if (!isSame) {
              const where: any = {};
              for (const field of uniqueFields) {
                where[field] = sanitized[field];
              }
              toUpdate.push({ where, data: sanitized });
            }
          }
          successCount++;
        }

        // 3. Batch insert new entries
        if (toCreate.length > 0) {
          await prismaModel.createMany({ data: toCreate });
          console.log(`   ➡️ Bulk created ${toCreate.length} rows`);
        }

        // 4. Batch update modified entries
        if (toUpdate.length > 0) {
          for (const item of toUpdate) {
            await prismaModel.updateMany({
              where: item.where,
              data: item.data,
            });
          }
          console.log(`   ➡️ Bulk updated ${toUpdate.length} rows`);
        }

        console.log(`✅ ${sheetName}: ${successCount} rows processed`);
      } catch (err: any) {
        console.error(`❌ Stopping at ${sheetName}: ${err.message}`);
        this.progress$.next({
          message: `❌ Upload stopped at ${sheetName}: ${err.message}`,
          percent,
        });
        return {
          success: false,
          message: `Upload stopped. Fix issues in sheet: ${sheetName}`,
          error: err.message,
        };
      }
    }

    // 👇 emit final completion AFTER all sheets
    this.progress$.next({
      message: `✅ Upload completed successfully`,
      percent: 100,
    });

    this.progress$.complete();

    return { success: true, message: 'Upload completed successfully' };
  }

  getProgressStream(): Observable<{ message: string; percent: number }> {
    return this.progress$.asObservable();
  }
}
