import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as XLSX from 'xlsx';



@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    private uniqueKeys: Record<string, string[]> = {
        Demography: ["state", "year", "indicator"],
        Demography_LGA: ["state", "lga", "year"],
        Access_Service_Utilization: ["state", "year", "indicator"],
        HFin_1: ["state", "year", "indicator", "exp_type", "status"],
        HFin_2: ["state", "year", "indicator", "exp_type", "status"],
        LGA_Fin: ["state", "lga", "year", "indicator", "exp_type", "status"],
        LGA_PCap: ["state", "lga", "year"],
        Scorecards: ["state", "name", "period", "indicator"],
        Partners_Mapping: ["state", "year", "partner", "intervention_group_correct"],
        HFcilities: ["state", "year", "indicator", "level", "ownership"],
        HFcilities_Service_Provision: ["state", "year", "service_provision"],
        HRH: ["state", "year", "institution", "ownership"],
        HRH_Professions: ["state", "year", "institution"],
        Insurance_Coverage: ["state", "year", "name", "indicator"],
        Health_Outcomes: ["state", "year", "indicator"],
        NDHS: ["state", "year", "category", "indicator"],
        Per_Capita: ["state", "year"], // only one per state/year
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

    async update(id: string, data: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.update({
            where: { id: Number(id) },
            data: {
                ...data,
                password: hashedPassword,
            },
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

    async validateUser(email: string, password: string) {
        const user = await this.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        return user;
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email, username: user.username, role: user.role, state: user.state };
        return {
            access_token: this.jwtService.sign(payload),
            user: payload
        };
    }

    async uploadFromWorkbook(year: number, workbook: XLSX.WorkBook) {
        try {


            for (const sheetName of workbook.SheetNames) {
                const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                if (!sheetData.length) continue;

                const modelName =
                    sheetName.charAt(0).toLowerCase() +
                    sheetName.slice(1).replace(/\s+/g, "_");

                const prismaModel = (this.prisma as any)[modelName];
                if (!prismaModel) {
                    console.warn(`⚠️ Skipping ${sheetName} — not found in Prisma client`);
                    continue;
                }

                for (const row of sheetData) {
                    const sanitized: any = {};
                    const rowObj = row as any;
                    for (const key in rowObj) {
                        if (!rowObj.hasOwnProperty(key)) continue;
                        let fieldName = key.replace(/\s+/g, "_").toLowerCase();
                        let value = rowObj[key];

                        if (fieldName === "period" && value) {
                            value = new Date(value);
                        }
                        if (fieldName === "per_capita" && typeof value === "number") {
                            value = Math.round(value);
                        }

                        sanitized[fieldName] = value;
                    }
                    sanitized.year = year;

                    // Define unique keys per model
                    let where: any = {};
                    switch (sheetName) {
                        case "Demography":
                            where = {
                                state_year_indicator: {
                                    state: sanitized.state,
                                    year: sanitized.year,
                                    indicator: sanitized.indicator,
                                },
                            };
                            break;

                        case "Demography_LGA":
                            where = {
                                state_lga_year: {
                                    state: sanitized.state,
                                    lga: sanitized.lga,
                                    year: sanitized.year,
                                },
                            };
                            break;

                        case "Access_Service_Utilization":
                            where = {
                                state_year_indicator: {
                                    state: sanitized.state,
                                    year: sanitized.year,
                                    indicator: sanitized.indicator,
                                },
                            };
                            break;

                        case "HFin_1":
                        case "HFin_2":
                            where = {
                                state_year_indicator_exp_type_status: {
                                    state: sanitized.state,
                                    year: sanitized.year,
                                    indicator: sanitized.indicator,
                                    exp_type: sanitized.exp_type,
                                    status: sanitized.status,
                                },
                            };
                            break;

                        case "LGA_Fin":
                            where = {
                                state_lga_year_indicator_exp_type_status: {
                                    state: sanitized.state,
                                    lga: sanitized.lga,
                                    year: sanitized.year,
                                    indicator: sanitized.indicator,
                                    exp_type: sanitized.exp_type,
                                    status: sanitized.status,
                                },
                            };
                            break;

                        case "LGA_PCap":
                            where = {
                                state_lga_year: {
                                    state: sanitized.state,
                                    lga: sanitized.lga,
                                    year: sanitized.year,
                                },
                            };
                            break;

                        case "Scorecards":
                            where = {
                                state_name_period_indicator: {
                                    state: sanitized.state,
                                    name: sanitized.name,
                                    period: sanitized.period,
                                    indicator: sanitized.indicator,
                                },
                            };
                            break;

                        default:
                            console.warn(`⚠️ No upsert rule for ${sheetName}, skipping...`);
                            continue;
                    }

                    try {
                        await prismaModel.upsert({
                            where,
                            update: sanitized,
                            create: sanitized,
                        });
                    } catch (err: any) {
                        console.error(`❌ Error upserting into ${modelName}:`, err.message);
                    }
                }

                console.log(`✅ Processed ${sheetData.length} rows for ${sheetName}`);
            }

            return { success: true, message: "Upload completed with upsert logic" };
        } catch (error) {
            console.error(`❌ Error processing upload for year ${year}:`, error.message);
            return { success: false, message: `Upload failed for year ${year}`, error: error.message };
        }
    }

    async uploadFromWorkbookYear(year: number, workbook: XLSX.WorkBook) {
        for (const sheetName of workbook.SheetNames) {
            const sheetData = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);
            if (!sheetData.length) continue;

            const modelName =
                sheetName.charAt(0).toLowerCase() +
                sheetName.slice(1).replace(/\s+/g, "_");

            const prismaModel = (this.prisma as any)[modelName];
            if (!prismaModel) {
                console.warn(`⚠️ Skipping ${sheetName} — not found in Prisma client`);
                continue;
            }

            console.log(`📂 Processing ${sheetName} ...`);

            let successCount = 0;
            try {
                for (const row of sheetData) {
                    const sanitized: Record<string, any> = {};

                    for (const key of Object.keys(row)) {
                        let fieldName = key.replace(/\s+/g, "_").toLowerCase();
                        let value = row[key];

                        // Handle "no data" gracefully
                        if (typeof value === "string" && value.trim().toLowerCase() === "no data") {
                            value = 0; // default to 0 for numbers
                        }

                        // Date handling
                        if (fieldName === "period" && value) {
                            try {
                                value = new Date(value);
                            } catch {
                                throw new Error(`Invalid date in ${sheetName}.${fieldName}: ${value}`);
                            }
                        }

                        // Round numbers if schema expects Int
                        if (
                            ["value", "coverage_area", "number", "per_capita", "state_population", "lga_population"].includes(fieldName) &&
                            typeof value === "number"
                        ) {
                            value = Math.round(value);
                        }

                        sanitized[fieldName] = value;
                    }

                    sanitized.year = year;

                    await prismaModel.create({ data: sanitized });
                    successCount++;
                }

                console.log(`✅ ${sheetName}: ${successCount} rows inserted`);
            } catch (err: any) {
                console.error(`❌ Stopping at ${sheetName}: ${err.message}`);
                return {
                    success: false,
                    message: `Upload stopped. Fix issues in sheet: ${sheetName}`,
                    error: err.message,
                };
            }
        }

        return { success: true, message: "Upload completed successfully" };
    }

    async uploadFromWorkbook1(workbook: XLSX.WorkBook) {
        for (const sheetName of workbook.SheetNames) {
            const sheetData = XLSX.utils.sheet_to_json<Record<string, any>>(
                workbook.Sheets[sheetName]
            );
            if (!sheetData.length) continue;

            const modelName =
                sheetName.charAt(0).toLowerCase() +
                sheetName.slice(1).replace(/\s+/g, "_");

            const prismaModel = (this.prisma as any)[modelName];
            if (!prismaModel) {
                console.warn(`⚠️ Skipping ${sheetName} — not found in Prisma client`);
                continue;
            }

            console.log(`📂 Processing ${sheetName} ...`);

            let successCount = 0;

            try {
                for (const row of sheetData) {
                    const sanitized: Record<string, any> = {};
                    for (const key of Object.keys(row)) {
                        let fieldName = key.replace(/\s+/g, "_").toLowerCase();
                        let value = row[key];

                        // Handle "no data"
                        // if (typeof value === "string" && (value.trim().toLowerCase() === "No Data" || value === "No Data" || value === undefined || value === null)) {
                        //     value = 0;
                        // }

                        // Date handling
                        if (fieldName === "period" && value) {
                            value = new Date(value);
                        }

                        sanitized[fieldName] = value;
                    }

                    // sanitized.year;

                    const uniqueFields = this.uniqueKeys[sheetName];
                    if (!uniqueFields) {
                        throw new Error(`No unique keys defined for sheet: ${sheetName}`);
                    }

                    const where: any = {};
                    for (const field of uniqueFields) {
                        where[field] = sanitized[field];
                    }

                    // Check if record exists
                    const existing = await prismaModel.findFirst({ where });

                    if (!existing) {
                        await prismaModel.create({ data: sanitized });
                    } else {
                        // Compare full record
                        const isSame = Object.keys(sanitized).every(
                            (key) => sanitized[key] === (existing as any)[key]
                        );

                        if (!isSame) {
                            await prismaModel.updateMany({
                                where,
                                data: sanitized,
                            });
                        }
                    }

                    successCount++;
                }

                console.log(`✅ ${sheetName}: ${successCount} rows processed`);
            } catch (err: any) {
                console.error(`❌ Stopping at ${sheetName}: ${err.message}`);
                return {
                    success: false,
                    message: `Upload stopped. Fix issues in sheet: ${sheetName}`,
                    error: err.message,
                };
            }
        }

        return { success: true, message: "Upload completed successfully" };
    }
}
