import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateThreatAssessmentDto,
  CreateThreatLgaDto,
} from './dto/create-threat-assessment.dto';
import { UpdateThreatAssessmentDto } from './dto/update-threat-assessment.dto';
import {
  getFullThreatAssessmentData,
  getAllThreatLgaRecords,
  parseHotspotLgas,
  THREAT_ASSESSMENT_DATA,
  ThreatStateData,
} from './data/threat-assessment-data';

const normalizeStr = (v: string | null | undefined) =>
  (v ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

@Injectable()
export class ThreatAssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all state threat/vulnerability assessments.
   * If DB has records, returns them; otherwise falls back to pre-packaged dataset.
   */
  async findAll(filters?: { zone?: string; risk?: string; year?: number }) {
    let totalCount = 0;
    try {
      totalCount = await this.prisma.threat_Vulnerability_Assessment.count();
      if (totalCount === 0) {
        // Auto-seed initial records into DB so real records with IDs exist
        await this.seed(filters?.year ?? 2026);
        totalCount = await this.prisma.threat_Vulnerability_Assessment.count();
      }
    } catch (err) {
      console.warn('Threat assessment DB count/seed notice:', err);
    }

    let rows: any[] = [];
    try {
      const whereClause: any = {};
      if (filters?.zone) {
        whereClause.zone = {
          equals: filters.zone.trim(),
          mode: 'insensitive',
        };
      }
      if (filters?.risk) {
        whereClause.risk = {
          equals: filters.risk.trim(),
          mode: 'insensitive',
        };
      }
      if (filters?.year) {
        whereClause.year = Number(filters.year);
      }

      rows = await this.prisma.threat_Vulnerability_Assessment.findMany({
        where: whereClause,
        orderBy: [{ zone: 'asc' }, { state: 'asc' }],
      });
    } catch {
      rows = [];
    }

    // Fallback to static dataset only if database is completely empty and couldn't be seeded
    let result = rows;
    if (result.length === 0 && totalCount === 0) {
      let data = getFullThreatAssessmentData();
      if (filters?.zone) {
        const normZ = normalizeStr(filters.zone);
        data = data.filter((d) => normalizeStr(d.zone) === normZ);
      }
      if (filters?.risk) {
        const normR = normalizeStr(filters.risk);
        data = data.filter((d) => normalizeStr(d.risk) === normR);
      }
      result = data.map((d, idx) => ({
        id: idx + 1,
        zone: d.zone,
        state: d.state,
        year: filters?.year ?? 2026,
        page: 'Threat Assessment',
        risk: d.risk,
        threat_level: d.risk,
        primary_threats: d.primary_threats,
        hotspots_lga: d.hotspots_lga,
        lgas: d.lgas.map((lgaName) => ({
          lga: lgaName,
          state: d.state,
          zone: d.zone,
          threat_level: d.risk,
          risk: d.risk,
          is_hotspot: true,
          primary_threats: d.primary_threats,
        })),
      }));
    } else {
      result = result.map((r) => {
        const parsed = parseHotspotLgas(r.hotspots_lga ?? '');
        return {
          ...r,
          threat_level: r.risk,
          lgas: parsed.map((lgaName) => ({
            lga: lgaName,
            state: r.state,
            zone: r.zone,
            threat_level: r.risk,
            risk: r.risk,
            is_hotspot: true,
            primary_threats: r.primary_threats,
          })),
        };
      });
    }

    const summary = this.calculateSummary(result);

    return {
      total_states: result.length,
      summary,
      data: result,
    };
  }

  /**
   * Returns aggregated statistics by risk level and zone.
   */
  async getSummary() {
    const { data } = await this.findAll();
    return this.calculateSummary(data);
  }

  /**
   * Find threat assessment for a specific state, along with all associated LGAs.
   */
  async findByState(state: string, year?: number) {
    let stateRow: any = null;
    let lgas: any[] = [];

    try {
      stateRow = await this.prisma.threat_Vulnerability_Assessment.findFirst({
        where: {
          state: { equals: state.trim(), mode: 'insensitive' },
          ...(year ? { year: Number(year) } : {}),
        },
      });

      if (stateRow) {
        lgas = await this.prisma.threat_Vulnerability_LGA.findMany({
          where: {
            state: { equals: state.trim(), mode: 'insensitive' },
            ...(year ? { year: Number(year) } : {}),
          },
          orderBy: { lga: 'asc' },
        });
      }
    } catch {
      stateRow = null;
      lgas = [];
    }

    // Fallback to in-memory dataset
    if (!stateRow) {
      const normState = normalizeStr(state);
      const match = THREAT_ASSESSMENT_DATA.find(
        (d) => normalizeStr(d.state) === normState,
      );
      if (!match) {
        throw new NotFoundException(
          `Threat/Vulnerability assessment for state "${state}" not found.`,
        );
      }
      const parsedLgas = parseHotspotLgas(match.hotspots_lga);
      return {
        data: {
          state: match.state,
          zone: match.zone,
          year: year ?? 2026,
          risk: match.risk,
          threat_level: match.risk,
          primary_threats: match.primary_threats,
          hotspots_lga: match.hotspots_lga,
          total_hotspots: parsedLgas.length,
          lgas: parsedLgas.map((lgaName) => ({
            lga: lgaName,
            state: match.state,
            zone: match.zone,
            threat_level: match.risk,
            risk: match.risk,
            is_hotspot: true,
            primary_threats: match.primary_threats,
          })),
        },
      };
    }

    const parsedLgas =
      lgas.length > 0
        ? lgas.map((item) => ({
            lga: item.lga,
            state: item.state,
            zone: item.zone,
            threat_level: item.risk,
            risk: item.risk,
            is_hotspot: true,
            primary_threats: item.primary_threats,
          }))
        : parseHotspotLgas(stateRow.hotspots_lga ?? '').map((name) => ({
            lga: name,
            state: stateRow.state,
            zone: stateRow.zone,
            threat_level: stateRow.risk,
            risk: stateRow.risk,
            is_hotspot: true,
            primary_threats: stateRow.primary_threats,
          }));

    return {
      data: {
        id: stateRow.id,
        state: stateRow.state,
        zone: stateRow.zone,
        year: stateRow.year,
        risk: stateRow.risk,
        threat_level: stateRow.risk,
        primary_threats: stateRow.primary_threats,
        hotspots_lga: stateRow.hotspots_lga,
        total_hotspots: parsedLgas.length,
        lgas: parsedLgas,
      },
    };
  }

  /**
   * Find threat assessment for all states and LGAs in a geopolitical zone.
   */
  async findByZone(zone: string, year?: number) {
    return this.findAll({ zone, year });
  }

  /**
   * Find all states and LGAs with a given risk level (e.g. CRITICAL, HIGH).
   */
  async findByRisk(risk: string, year?: number) {
    return this.findAll({ risk, year });
  }

  /**
   * Returns all hotspot LGAs across the country with their issues and risk levels.
   */
  async findAllLgas(filters?: {
    zone?: string;
    state?: string;
    risk?: string;
  }) {
    let rows: any[] = [];
    try {
      const whereClause: any = {};
      if (filters?.zone) {
        whereClause.zone = {
          equals: filters.zone.trim(),
          mode: 'insensitive',
        };
      }
      if (filters?.state) {
        whereClause.state = {
          equals: filters.state.trim(),
          mode: 'insensitive',
        };
      }
      if (filters?.risk) {
        whereClause.risk = {
          equals: filters.risk.trim(),
          mode: 'insensitive',
        };
      }
      rows = await this.prisma.threat_Vulnerability_LGA.findMany({
        where: whereClause,
        orderBy: [{ state: 'asc' }, { lga: 'asc' }],
      });
    } catch {
      rows = [];
    }

    if (!rows || rows.length === 0) {
      let lgas = getAllThreatLgaRecords();
      if (filters?.zone) {
        const norm = normalizeStr(filters.zone);
        lgas = lgas.filter((l) => normalizeStr(l.zone) === norm);
      }
      if (filters?.state) {
        const norm = normalizeStr(filters.state);
        lgas = lgas.filter((l) => normalizeStr(l.state) === norm);
      }
      if (filters?.risk) {
        const norm = normalizeStr(filters.risk);
        lgas = lgas.filter((l) => normalizeStr(l.risk) === norm);
      }
      rows = lgas.map((l, idx) => ({
        id: idx + 1,
        ...l,
        threat_level: l.risk,
        is_hotspot: true,
      }));
    } else {
      rows = rows.map((r) => ({
        ...r,
        threat_level: r.risk,
        is_hotspot: true,
      }));
    }

    return {
      total_lgas: rows.length,
      data: rows,
    };
  }

  /**
   * Look up a specific LGA to see its risk level, state, zone, and issues.
   */
  async findByLga(lgaName: string) {
    let lgaRow: any = null;
    try {
      lgaRow = await this.prisma.threat_Vulnerability_LGA.findFirst({
        where: {
          lga: { equals: lgaName.trim(), mode: 'insensitive' },
        },
      });
    } catch {
      lgaRow = null;
    }

    if (!lgaRow) {
      const normLga = normalizeStr(lgaName);
      const all = getAllThreatLgaRecords();
      const match = all.find(
        (l) =>
          normalizeStr(l.lga) === normLga ||
          normalizeStr(l.lga).includes(normLga),
      );
      if (!match) {
        throw new NotFoundException(
          `LGA "${lgaName}" not found in threat/vulnerability hotspot assessment.`,
        );
      }
      return {
        data: {
          ...match,
          threat_level: match.risk,
          is_hotspot: true,
        },
      };
    }

    return {
      data: {
        ...lgaRow,
        threat_level: lgaRow.risk,
        is_hotspot: true,
      },
    };
  }

  /**
   * Seed or re-seed the assessment data into the database.
   */
  async seed(year = 2026) {
    let seededStates = 0;
    let seededLgas = 0;

    for (const item of THREAT_ASSESSMENT_DATA) {
      const existing =
        await this.prisma.threat_Vulnerability_Assessment.findFirst({
          where: {
            state: { equals: item.state, mode: 'insensitive' },
            year,
          },
        });

      if (existing) {
        await this.prisma.threat_Vulnerability_Assessment.update({
          where: { id: existing.id },
          data: {
            zone: item.zone,
            risk: item.risk,
            primary_threats: item.primary_threats,
            hotspots_lga: item.hotspots_lga,
          },
        });
      } else {
        await this.prisma.threat_Vulnerability_Assessment.create({
          data: {
            zone: item.zone,
            state: item.state,
            year,
            risk: item.risk,
            primary_threats: item.primary_threats,
            hotspots_lga: item.hotspots_lga,
          },
        });
      }
      seededStates++;

      const lgas = parseHotspotLgas(item.hotspots_lga);
      for (const lga of lgas) {
        const existingLga =
          await this.prisma.threat_Vulnerability_LGA.findFirst({
            where: {
              state: { equals: item.state, mode: 'insensitive' },
              lga: { equals: lga, mode: 'insensitive' },
              year,
            },
          });

        if (existingLga) {
          await this.prisma.threat_Vulnerability_LGA.update({
            where: { id: existingLga.id },
            data: {
              zone: item.zone,
              risk: item.risk,
              primary_threats: item.primary_threats,
            },
          });
        } else {
          await this.prisma.threat_Vulnerability_LGA.create({
            data: {
              zone: item.zone,
              state: item.state,
              lga,
              risk: item.risk,
              primary_threats: item.primary_threats,
              year,
            },
          });
        }
        seededLgas++;
      }
    }

    return {
      message: 'Threat/Vulnerability Assessment data seeded successfully',
      seeded_states: seededStates,
      seeded_lgas: seededLgas,
      year,
    };
  }

  async create(dto: CreateThreatAssessmentDto) {
    const created =
      await this.prisma.threat_Vulnerability_Assessment.create({
        data: {
          zone: dto.zone,
          state: dto.state,
          year: dto.year,
          page: dto.page,
          risk: dto.risk,
          primary_threats: dto.primary_threats,
          hotspots_lga: dto.hotspots_lga,
        },
      });

    // Also parse and create LGA entries if hotspots_lga was supplied
    if (dto.hotspots_lga) {
      const lgas = parseHotspotLgas(dto.hotspots_lga);
      for (const lga of lgas) {
        await this.prisma.threat_Vulnerability_LGA.create({
          data: {
            zone: dto.zone,
            state: dto.state,
            year: dto.year,
            lga,
            risk: dto.risk,
            primary_threats: dto.primary_threats,
          },
        });
      }
    }

    return created;
  }

  async findOne(id: number) {
    const row =
      await this.prisma.threat_Vulnerability_Assessment.findUnique({
        where: { id },
      });
    if (!row) {
      throw new NotFoundException(`Assessment with id #${id} not found`);
    }
    return {
      ...row,
      lgas: parseHotspotLgas(row.hotspots_lga ?? ''),
    };
  }

  async getYears(): Promise<number[]> {
    try {
      const rows = await this.prisma.threat_Vulnerability_Assessment.findMany({
        select: { year: true },
        distinct: ['year'],
        where: { year: { not: null } },
        orderBy: { year: 'desc' },
      });
      const dbYears = rows.map((r) => r.year as number).filter(Boolean);
      if (dbYears.length > 0) return dbYears;
    } catch {}
    return [2026, 2025, 2024, 2023];
  }

  async bulkUpdate(
    items: Array<{
      id?: number;
      state: string;
      zone?: string;
      risk?: string;
      primary_threats?: string;
      hotspots_lga?: string;
      year?: number;
    }>,
    defaultYear = 2026,
  ) {
    const results: any[] = [];
    for (const item of items) {
      if (!item.state) continue;
      const yr = item.year ? Number(item.year) : defaultYear;
      let record: any = null;

      if (item.id) {
        try {
          const existingById =
            await this.prisma.threat_Vulnerability_Assessment.findUnique({
              where: { id: Number(item.id) },
            });
          if (existingById) {
            record = await this.prisma.threat_Vulnerability_Assessment.update({
              where: { id: Number(item.id) },
              data: {
                state: item.state.trim(),
                zone: item.zone?.trim(),
                risk: item.risk?.trim().toUpperCase(),
                primary_threats: item.primary_threats?.trim(),
                hotspots_lga: item.hotspots_lga?.trim(),
                year: yr,
              },
            });
          }
        } catch {}
      }

      if (!record) {
        try {
          const existingByState =
            await this.prisma.threat_Vulnerability_Assessment.findFirst({
              where: {
                state: { equals: item.state.trim(), mode: 'insensitive' },
                year: yr,
              },
            });
          if (existingByState) {
            record = await this.prisma.threat_Vulnerability_Assessment.update({
              where: { id: existingByState.id },
              data: {
                zone: item.zone?.trim() ?? existingByState.zone,
                risk: item.risk?.trim().toUpperCase() ?? existingByState.risk,
                primary_threats:
                  item.primary_threats?.trim() ??
                  existingByState.primary_threats,
                hotspots_lga:
                  item.hotspots_lga?.trim() ?? existingByState.hotspots_lga,
              },
            });
          } else {
            record = await this.prisma.threat_Vulnerability_Assessment.create({
              data: {
                state: item.state.trim(),
                zone: item.zone?.trim(),
                risk: item.risk?.trim().toUpperCase(),
                primary_threats: item.primary_threats?.trim(),
                hotspots_lga: item.hotspots_lga?.trim(),
                year: yr,
              },
            });
          }
        } catch {}
      }

      if (record) {
        results.push(record);

        // Sync LGA hotspots
        if (item.hotspots_lga) {
          const lgas = parseHotspotLgas(item.hotspots_lga);
          try {
            await this.prisma.threat_Vulnerability_LGA.deleteMany({
              where: {
                state: { equals: item.state.trim(), mode: 'insensitive' },
                year: yr,
              },
            });
            if (lgas.length > 0) {
              await this.prisma.threat_Vulnerability_LGA.createMany({
                data: lgas.map((lga) => ({
                  zone: item.zone?.trim() ?? null,
                  state: item.state.trim(),
                  lga,
                  risk: item.risk?.trim().toUpperCase() ?? null,
                  primary_threats: item.primary_threats?.trim() ?? null,
                  year: yr,
                })),
              });
            }
          } catch {}
        }
      }
    }

    return {
      message: `Successfully saved ${results.length} security assessment records`,
      total: results.length,
      data: results,
    };
  }

  async update(id: number, dto: UpdateThreatAssessmentDto) {
    const updated = await this.prisma.threat_Vulnerability_Assessment.update({
      where: { id },
      data: {
        ...(dto.zone !== undefined ? { zone: dto.zone?.trim() } : {}),
        ...(dto.state !== undefined ? { state: dto.state?.trim() } : {}),
        ...(dto.year !== undefined ? { year: dto.year } : {}),
        ...(dto.risk !== undefined
          ? { risk: dto.risk?.trim().toUpperCase() }
          : {}),
        ...(dto.primary_threats !== undefined
          ? { primary_threats: dto.primary_threats?.trim() }
          : {}),
        ...(dto.hotspots_lga !== undefined
          ? { hotspots_lga: dto.hotspots_lga?.trim() }
          : {}),
      },
    });

    if (dto.hotspots_lga !== undefined && updated.state) {
      const lgas = parseHotspotLgas(dto.hotspots_lga ?? '');
      try {
        await this.prisma.threat_Vulnerability_LGA.deleteMany({
          where: {
            state: { equals: updated.state, mode: 'insensitive' },
            ...(updated.year ? { year: updated.year } : {}),
          },
        });
        if (lgas.length > 0) {
          await this.prisma.threat_Vulnerability_LGA.createMany({
            data: lgas.map((lga) => ({
              zone: updated.zone,
              state: updated.state as string,
              lga,
              risk: updated.risk,
              primary_threats: updated.primary_threats,
              year: updated.year,
            })),
          });
        }
      } catch {}
    }

    return updated;
  }

  async remove(id: number) {
    try {
      const existing =
        await this.prisma.threat_Vulnerability_Assessment.findUnique({
          where: { id },
        });
      if (existing?.state) {
        await this.prisma.threat_Vulnerability_LGA.deleteMany({
          where: {
            state: { equals: existing.state, mode: 'insensitive' },
            ...(existing.year ? { year: existing.year } : {}),
          },
        });
      }
    } catch {}

    return this.prisma.threat_Vulnerability_Assessment.delete({
      where: { id },
    });
  }

  private calculateSummary(items: any[]) {
    const riskCounts: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      ELEVATED: 0,
      MODERATE: 0,
      'LOW-MODERATE': 0,
    };

    const zoneCounts: Record<string, number> = {};
    let totalHotspotLgas = 0;

    for (const item of items) {
      const r = (item.risk ?? '').toUpperCase().trim();
      if (riskCounts[r] !== undefined) {
        riskCounts[r]++;
      } else {
        riskCounts[r] = (riskCounts[r] || 0) + 1;
      }

      const z = item.zone ?? 'Unknown';
      zoneCounts[z] = (zoneCounts[z] || 0) + 1;

      const lgas = item.lgas ?? parseHotspotLgas(item.hotspots_lga ?? '');
      totalHotspotLgas += lgas.length;
    }

    return {
      total_states: items.length,
      total_hotspot_lgas: totalHotspotLgas,
      risk_breakdown: riskCounts,
      zone_breakdown: zoneCounts,
    };
  }
}

