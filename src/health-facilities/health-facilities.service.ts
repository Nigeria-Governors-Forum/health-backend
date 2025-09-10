import { Injectable } from '@nestjs/common';
import { CreateHealthFacilityDto } from './dto/create-health-facility.dto';
import { UpdateHealthFacilityDto } from './dto/update-health-facility.dto';
import { PrismaService } from 'src/prisma/prisma.service';


interface Facility {
  id: number | null;
  zone?: string | null;
  state?: string | null;
  year?: number | null;
  page?: string | null;
  indicator?: string | null;
  level?: string | null;
  ownership?: "Public" | "Private" | null;
  value?: number | null;
}

interface StateSummary {
  state: string;
  value: number;
}

export const capitalizeWords = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const normalizeKey = (s?: string) => {
  return (s ?? "").toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
@Injectable()
export class HealthFacilitiesService {

  constructor(private readonly prisma: PrismaService) { }

  create(createHealthFacilityDto: CreateHealthFacilityDto) {
    return 'This action adds a new healthFacility';
  }

  findAll() {
    return `This action returns all healthFacilities`;
  }

  findOne(id: number) {
    return `This action returns a #${id} healthFacility`;
  }

  update(id: number, updateHealthFacilityDto: UpdateHealthFacilityDto) {
    return `This action updates a #${id} healthFacility`;
  }

  remove(id: number) {
    return `This action removes a #${id} healthFacility`;
  }

  async getHealthFacilityData(state: string, year: string) {
    const hFacilities = await this.prisma.hFcilities.findMany({
      where: { state, year: Number(year) }
    });
    const totals = hFacilities.reduce((acc, f) => {
      const level = f.level ?? "Unknown";
      const value = f.value ?? 0;
      acc[level] = (acc[level] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    const grouped = hFacilities.reduce((acc, item) => {
      const levelKey = item.level ?? "Unknown";
      const { ownership, value } = item;

      if (!acc[levelKey]) {
        acc[levelKey] = {};
      }
      acc[levelKey][ownership] = value;

      return acc;
    }, {});

    const serviceProvision = await this.prisma.hFcilities_Service_Provision.findMany({
      where: { state, year: Number(year) }
    });

    const rows = await this.prisma.demography.findMany({
      where: { state, year: Number(year) }
    });

    const data: Record<string, number | null> = {};
    rows.forEach((row) => {
      const key = row.indicator
        ? row.indicator.toLowerCase().replace(/\s+/g, "_")
        : "";
      if (key) data[key] = row.value;
    });

    const totalHealth = Object.values(totals).reduce<number>(
      (a, b) => a + b,
      0
    );
    const perPerson =
      data["total_population"] && data["total_population"] !== 0
        ? parseFloat(Number((totalHealth / data["total_population"]) * 10000).toFixed(0))
        : "N/A";

    return {
      data: {
        h_facilities: grouped,
        health_facilities: totalHealth,
        per_person: perPerson,
        service_provision: serviceProvision
      },
    };
  }


async getZonalHealthFacilityData(zone: string, year: string) {
  const yearNum = Number(year);

  // 1) load ALL health facilities for the year
  const hFacilities = await this.prisma.hFcilities.findMany({
    where: { year: yearNum }
  });

  // console.log(`🔎 Loaded ${hFacilities.length} facility rows for year ${yearNum}`);

  // 2) group by state (normalize key), summing public/private/other
  const groupedByState = hFacilities.reduce<Record<string, {
    officialStateName: string;
    zone?: string | null;
    public: number;
    private: number;
    other: number;
    total: number;
  }>>((acc, row) => {
    const rawState = (row.state ?? "Unknown").toString().trim();
    const stateKey = normalizeKey(rawState);

    if (!acc[stateKey]) {
      acc[stateKey] = {
        officialStateName: rawState,
        zone: row.zone ?? null,
        public: 0,
        private: 0,
        other: 0,
        total: 0
      };
    }

    const ownershipValue = Number(row.value ?? 0) || 0;
    const ownership = (row.ownership ?? "").toString().toLowerCase();

    if (ownership.includes("public")) acc[stateKey].public += ownershipValue;
    else if (ownership.includes("private")) acc[stateKey].private += ownershipValue;
    else acc[stateKey].other += ownershipValue;

    acc[stateKey].total += ownershipValue;

    // prefer zone if not already set
    if (!acc[stateKey].zone && row.zone) acc[stateKey].zone = row.zone;

    return acc;
  }, {});

  const uniqueStateKeys = Object.keys(groupedByState);
  // console.log("📌 Unique states found:", uniqueStateKeys.length, uniqueStateKeys.slice(0, 20));

  if (uniqueStateKeys.length === 0) {
    return {
      data: {
        zone: capitalizeWords(zone),
        year: yearNum,
        zoneWithin: [],
        allStates: []
      }
    };
  }

  // 3) Fetch demography rows for these states (one call)
  const stateNamesToQuery = uniqueStateKeys.map(state => groupedByState[state].officialStateName);
  const demRows = await this.prisma.demography.findMany({
    where: {
      year: yearNum,
      state: { in: stateNamesToQuery }
    }
  });

  // console.log(`📊 Loaded ${demRows.length} demography rows for ${stateNamesToQuery.length} states`);

  // 4) Index demography rows by state
  const demByState = demRows.reduce<Record<string, any[]>>((acc, reduce) => {
    const key = normalizeKey(reduce.state ?? undefined);
    if (!acc[key]) acc[key] = [];
    acc[key].push(reduce);
    return acc;
  }, {});

  // 5) population extractor
  function extractPopulationForStateRows(rows?: any[]): number | null {
    if (!rows || rows.length === 0) return null;

    const candidate = rows.find(value => {
      const ind = (value.indicator ?? "").toString().toLowerCase();
      return ind.includes("total") && ind.includes("population");
    });
    if (candidate) return Number(candidate.value ?? 0) || null;

    const alt = rows.find(value => {
      const ind = (value.indicator ?? "").toString().toLowerCase().replace(/\s+/g, "_");
      return ind === "total_population" || ind === "population";
    });
    if (alt) return Number(alt.value ?? 0) || null;

    const numericValues = rows.map(value => Number(value.value ?? NaN)).filter(Number.isFinite);
    if (numericValues.length === 0) return null;
    return Math.max(...numericValues);
  }

  // 6) Build summaries
  const allStates = uniqueStateKeys.map((stateKey) => {
    const groupData = groupedByState[stateKey];
    const demRowsForState = demByState[stateKey] ?? [];

    const population = extractPopulationForStateRows(demRowsForState);

    const ratePer10k =
      population && population > 0 ? parseFloat((Number(groupData.total / population) * 10000).toFixed(0)) : null;

    return {
      state: groupData.officialStateName,
      zone: groupData.zone ?? null,
      public: groupData.public,
      private: groupData.private,
      other: groupData.other,
      total: groupData.total,
      population,
      rate_graph: ratePer10k !== null ? Number(ratePer10k.toFixed(2)) : null
    };
  });

  // 7) Filter zoneWithin
  const requestedZoneNorm = normalizeKey(zone);
  const zoneWithin = allStates.filter(state => normalizeKey(state.zone ?? "") === requestedZoneNorm);

  // sort
  allStates.sort((a, b) => b.total - a.total);
  zoneWithin.sort((a, b) => b.total - a.total);

  // console.log(`➡️ zoneWithin: ${zoneWithin.length}, allStates: ${allStates.length}`);

  // 8) return
  return {
    data: {
      zone: capitalizeWords(zone),
      year: yearNum,
      zoneWithin,
      allStates,
      meta: {
        totalFacilityRows: hFacilities.length,
        uniqueStates: allStates.length
      }
    }
  };
}


}
