import { Injectable } from '@nestjs/common';
import { CreateHumanResourceDto } from './dto/create-human-resource.dto';
import { UpdateHumanResourceDto } from './dto/update-human-resource.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HumanResourceService {
  constructor(private readonly prisma: PrismaService) { }

  create(createHumanResourceDto: CreateHumanResourceDto) {
    return 'This action adds a new humanResource';
  }

  findAll() {
    return `This action returns all humanResource`;
  }

  findOne(id: number) {
    return `This action returns a #${id} humanResource`;
  }

  update(id: number, updateHumanResourceDto: UpdateHumanResourceDto) {
    return `This action updates a #${id} humanResource`;
  }

  remove(id: number) {
    return `This action removes a #${id} humanResource`;
  }

  async getHumanResourceData(state: string, year: string) {
    const HRH = await this.prisma.hRH.findMany({
      where: { state, year: Number(year) },
    });

    const hRH = await this.prisma.health_Training_Institutions.findMany({
      where: { state, year: Number(year) },
    });

    const group = hRH.reduce(
      (acc: any, item) => {
        const inst = item?.institution?.trim(); // clean up spaces
        if (!inst) {
          return acc;
        }
        if (!acc[inst]) {
          acc[inst] = { institution: inst, private: 0, public: 0, total: 0 };
        }

        // const value = item?.value ?? 0;

        if (item?.ownership?.toLowerCase().includes('private')) {
          acc[inst].private += item.value ?? 0;
        } else if (item?.ownership?.toLowerCase().includes('public')) {
          acc[inst].public += item.value ?? 0;
        }

        acc[inst].total = acc[inst].private + acc[inst].public;

        return acc;
      },
      {} as Record<
        string,
        { institution: string; private: number; public: number; total: number }
      >,
    );

    const grouped = Object.values(group);

    const grandTotal = grouped.reduce(
      (acc: any, row: any) => {
        acc.private += row.private;
        acc.public += row.public;
        acc.total += row.total;
        return acc;
      },
      { institution: 'Total', private: 0, public: 0, total: 0 },
    );
    grouped.push(grandTotal);

    const admissionQuota = await this.prisma.admission_Quota.findMany({
      where: { state, year: Number(year) },
    });

    const groupedQuota = admissionQuota.reduce(
      (acc: any, item) => {
        const school = item.indicator?.trim();
        if (!school) return acc;
        if (!acc[school]) {
          acc[school] = { institution: school, programs: [] };
        }
        acc[school].programs.push({
          program: item.faculty,
          quota: item.value,
        });
        return acc;
      },
      {} as Record<string, { institution: string; programs: any[] }>,
    );

    const admissionQuotaList = Object.values(groupedQuota);

    return {
      data: {
        HRH: HRH.reduce(
          (acc, cur) => acc + (Number(cur.values ?? 0) || 0),
          0,
        ),
        training_breakdown: grouped,
        hRH: hRH.reduce((acc, cur) => acc + (Number(cur?.value) || 0), 0),
        profession: HRH,
        admission_quota: admissionQuotaList,
      },
    };
  }



  private normalizeZonalStateName(stateName: string) {
    const normalized = stateName
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, '');
    return ['nasarawa', 'nassarawa', 'nasarrawa'].includes(normalized)
      ? 'nasarawa'
      : normalized;
  }


  async getZonalHumanResourceData(year?: string, state?: string) {
    // Use the requested year, or fall back to the latest available HRH year.
    let yearNum = year ? Number(year) : NaN;

    if (!Number.isFinite(yearNum)) {
      const latestHRH = await this.prisma.hRH.findFirst({
        where: { year: { not: null } },
        orderBy: { year: 'desc' },
        select: { year: true },
      });

      yearNum = latestHRH?.year ?? new Date().getFullYear();
    }

    // Map each geopolitical zone to its constituent states.
    const zones: Record<string, string[]> = {
      'north central': [
        'Benue',
        'Kogi',
        'Kwara',
        'Nasarawa',
        'Niger',
        'Plateau',
        'FCT',
      ],
      'north east': ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'],
      'north west': [
        'Jigawa',
        'Kaduna',
        'Kano',
        'Katsina',
        'Kebbi',
        'Sokoto',
        'Zamfara',
      ],
      'south east': ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
      'south south': [
        'Akwa Ibom',
        'Bayelsa',
        'Cross River',
        'Delta',
        'Edo',
        'Rivers',
      ],
      'south west': ['Ekiti', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo'],
    };

    // These are the four categories displayed in the stacked bar chart.
    type TrainingInstitutionCategory =
      | 'College of Medicine'
      | 'Schools of Nursing and Midwifery'
      | 'Schools of Health Technology'
      | 'Schools of Pharmacy';

    const trainingInstitutionCategories: TrainingInstitutionCategory[] = [
      'College of Medicine',
      'Schools of Nursing and Midwifery',
      'Schools of Health Technology',
      'Schools of Pharmacy',
    ];

    // Map database institution names to the chart categories.
    // Handles singular/plural names and alternative database labels.
    const trainingInstitutionCategoryByKey = new Map<
      string,
      TrainingInstitutionCategory
    >([
      ['collegeofmedicine', 'College of Medicine'],
      ['collegesofmedicine', 'College of Medicine'],

      ['schoolofnursingandmidwifery', 'Schools of Nursing and Midwifery'],
      ['schoolsofnursingandmidwifery', 'Schools of Nursing and Midwifery'],
      ['schoolsofnursingmidwifery', 'Schools of Nursing and Midwifery'],

      ['schoolofhealthtechnology', 'Schools of Health Technology'],
      ['schoolsofhealthtechnology', 'Schools of Health Technology'],

      // Database uses School(s) of Pharmacy.
      // Frontend displays Faculty/Dept of Pharmacy.
      ['schoolofpharmacy', 'Schools of Pharmacy'],
      ['schoolsofpharmacy', 'Schools of Pharmacy'],
    ]);

    // Normalize institution names so differences in spaces,
    // capitalization, slashes and punctuation do not affect matching.
    const getTrainingInstitutionCategory = (
      institution: string | null,
    ): TrainingInstitutionCategory | undefined => {
      if (!institution) return undefined;

      const key = institution.toLowerCase().replace(/[^a-z]/g, '');

      return trainingInstitutionCategoryByKey.get(key);
    };

    const zoneStates = Object.values(zones).flat();

    // Include alternative spellings of Nasarawa for database matching.
    const stateNames = [...zoneStates, 'Nassarawa', 'Nasarrawa'];

    // Fetch HRH records for the selected year.
    const hrhRecords = await this.prisma.hRH.findMany({
      where: {
        year: yearNum,
        state: { in: stateNames },
      },
    });

    // Fetch population records for the selected year.
    const populationRecords = await this.prisma.demography.findMany({
      where: {
        year: yearNum,
        state: { in: stateNames },
      },
    });

    // Fetch training institution records.
    // Public and Private records are both included and will be aggregated.
    const trainingRecords =
      await this.prisma.health_Training_Institutions.findMany({
        where: {
          year: yearNum,
          state: { in: stateNames },
        },
      });

    // Fetch admission quota records.
    const quotaRecords = await this.prisma.admission_Quota.findMany({
      where: {
        state: { in: stateNames },
      },
    });

    // Normalize state names and map them to their official zone state names.
    const canonicalStateByKey = new Map(
      zoneStates.map((stateName) => [
        this.normalizeZonalStateName(stateName),
        stateName,
      ]),
    );

    const getCanonicalState = (stateName: string | null | undefined) => {
      if (!stateName) return undefined;

      return canonicalStateByKey.get(
        this.normalizeZonalStateName(stateName),
      );
    };

    const trendState = getCanonicalState(state);
    const trendStateNames = trendState
      ? stateNames.filter((stateName) => getCanonicalState(stateName) === trendState)
      : [];

    const [hrhTrendRecords, populationTrendRecords, trainingTrendRecords, quotaTrendRecords] =
      await Promise.all([
        this.prisma.hRH.findMany({
          where: {
            year: { not: null },
            state: { in: trendStateNames },
          },
          orderBy: { year: 'asc' },
        }),
        this.prisma.demography.findMany({
          where: {
            year: { not: null },
            state: { in: trendStateNames },
          },
          orderBy: { year: 'asc' },
        }),
        this.prisma.health_Training_Institutions.findMany({
          where: {
            year: { not: null },
            state: { in: trendStateNames },
          },
          orderBy: { year: 'asc' },
        }),
        this.prisma.admission_Quota.findMany({
          where: {
            year: { not: null },
            state: { in: trendStateNames },
          },
          orderBy: { year: 'asc' },
        }),
      ]);

    // --------------------------------------------------
    // 1. Aggregate HRH by state.
    // --------------------------------------------------
    const hrhByState: Record<string, number> = {};

    for (const record of hrhRecords) {
      const stateName = getCanonicalState(record.state);
      if (!stateName) continue;

      hrhByState[stateName] =
        (hrhByState[stateName] ?? 0) + Number(record.values ?? 0);
    }

    // --------------------------------------------------
    // 2. Aggregate population by state.
    // --------------------------------------------------
    const populationByState: Record<string, number> = {};

    for (const record of populationRecords) {
      const stateName = getCanonicalState(record.state);
      if (!stateName) continue;

      populationByState[stateName] =
        (populationByState[stateName] ?? 0) + Number(record.value ?? 0);
    }

    // --------------------------------------------------
    // 3. Aggregate health training institutions by state
    //    and institution category.
    //
    //    Public and Private values are added together.
    //    Ownership is NOT a separate chart category.
    // --------------------------------------------------
    const trainingByState: Record<string, number> = {};

    const trainingByStateAndCategory: Record<
      string,
      Record<TrainingInstitutionCategory, number>
    > = {};

    for (const record of trainingRecords) {
      const stateName = getCanonicalState(record.state);
      if (!stateName) continue;

      const value = Number(record.value ?? 0);

      // Add the record value to the state's overall institution total.
      trainingByState[stateName] =
        (trainingByState[stateName] ?? 0) + value;

      // Match the database institution name to one of the four categories.
      const category = getTrainingInstitutionCategory(record.institution);

      // Ignore institution names that do not match the four categories.
      if (!category) continue;

      // Initialize all four categories for a state.
      trainingByStateAndCategory[stateName] ??= {
        'College of Medicine': 0,
        'Schools of Nursing and Midwifery': 0,
        'Schools of Health Technology': 0,
        'Schools of Pharmacy': 0,
      };

      // Add Public and Private values to the same category.
      trainingByStateAndCategory[stateName][category] += value;
    }

    // --------------------------------------------------
    // 4. Aggregate admission quota by state.
    // --------------------------------------------------
    const quotaByState: Record<string, number> = {};

    for (const record of quotaRecords) {
      const stateName = getCanonicalState(record.state);
      if (!stateName) continue;

      quotaByState[stateName] =
        (quotaByState[stateName] ?? 0) + Number(record.value ?? 0);
    }

    // Default institution categories for states with no matching records.
    const emptyTrainingCategories = (): Record<
      TrainingInstitutionCategory,
      number
    > => ({
      'College of Medicine': 0,
      'Schools of Nursing and Midwifery': 0,
      'Schools of Health Technology': 0,
      'Schools of Pharmacy': 0,
    });

    const trendByStateAndYear = new Map<
      string,
      {
        state: string;
        year: number;
        total_hrh: number;
        population: number;
        training_institutions: number;
        health_training_institutions: Record<
          TrainingInstitutionCategory,
          number
        >;
        admission_quota: number;
      }
    >();

    const getTrendEntry = (stateName: string, year: number) => {
      const key = `${stateName}:${year}`;
      let entry = trendByStateAndYear.get(key);

      if (!entry) {
        entry = {
          state: stateName,
          year,
          total_hrh: 0,
          population: 0,
          training_institutions: 0,
          health_training_institutions: emptyTrainingCategories(),
          admission_quota: 0,
        };
        trendByStateAndYear.set(key, entry);
      }

      return entry;
    };

    for (const record of hrhTrendRecords) {
      const stateName = getCanonicalState(record.state);
      if (!stateName || record.year === null) continue;

      getTrendEntry(stateName, record.year).total_hrh += Number(
        record.values ?? 0,
      );
    }

    for (const record of populationTrendRecords) {
      const stateName = getCanonicalState(record.state);
      if (!stateName || record.year === null) continue;

      getTrendEntry(stateName, record.year).population += Number(
        record.value ?? 0,
      );
    }

    for (const record of trainingTrendRecords) {
      const stateName = getCanonicalState(record.state);
      if (!stateName || record.year === null) continue;

      const trendEntry = getTrendEntry(stateName, record.year);
      const value = Number(record.value ?? 0);
      trendEntry.training_institutions += value;

      const category = getTrainingInstitutionCategory(record.institution);
      if (category) {
        trendEntry.health_training_institutions[category] += value;
      }
    }

    for (const record of quotaTrendRecords) {
      const stateName = getCanonicalState(record.state);
      if (!stateName || record.year === null) continue;

      getTrendEntry(stateName, record.year).admission_quota += Number(
        record.value ?? 0,
      );
    }

    const trend = Array.from(trendByStateAndYear.values())
      .map((entry) => ({
        ...entry,
        hrh_density:
          entry.population > 0
            ? Number(((entry.total_hrh / entry.population) * 10000).toFixed(2))
            : null,
      }))
      .filter((entry) => entry.state === trendState)
      .sort(
        (a, b) =>
          a.year - b.year || a.state.localeCompare(b.state),
      );

    // --------------------------------------------------
    // 5. Build zonal data.
    //    Each zone contains state totals and chart-ready data.
    // --------------------------------------------------
    const zonalData = Object.entries(zones).map(
      ([zoneName, statesInZone]) => {
        const states = statesInZone.map((stateName) => {
          const totalHRH = hrhByState[stateName] ?? 0;
          const population = populationByState[stateName] ?? 0;

          const institutionCategories =
            trainingByStateAndCategory[stateName] ??
            emptyTrainingCategories();

          return {
            state: stateName,
            total_hrh: totalHRH,
            population,

            hrh_density:
              population > 0
                ? Number(((totalHRH / population) * 10000).toFixed(2))
                : null,

            training_institutions: trainingByState[stateName] ?? 0,

            // Contains the four institution category totals for this state.
            health_training_institutions: institutionCategories,

            admission_quota: quotaByState[stateName] ?? 0,
          };
        });

        const totalHRH = states.reduce(
          (sum, item) => sum + item.total_hrh,
          0,
        );

        const totalPopulation = states.reduce(
          (sum, item) => sum + item.population,
          0,
        );

        // Calculate institution totals for this geopolitical zone.
        const trainingInstitutionsByCategory = Object.fromEntries(
          trainingInstitutionCategories.map((category) => [
            category,
            states.reduce(
              (sum, item) =>
                sum + item.health_training_institutions[category],
              0,
            ),
          ]),
        ) as Record<TrainingInstitutionCategory, number>;

        return {
          zone: zoneName,

          summary: {
            total_hrh: totalHRH,
            total_population: totalPopulation,

            hrh_density:
              totalPopulation > 0
                ? Number(
                  ((totalHRH / totalPopulation) * 10000).toFixed(2),
                )
                : null,

            total_training_institutions: states.reduce(
              (sum, item) => sum + item.training_institutions,
              0,
            ),

            // Four category totals for this zone.
            health_training_institutions: trainingInstitutionsByCategory,

            total_admission_quota: states.reduce(
              (sum, item) => sum + item.admission_quota,
              0,
            ),
          },

          states,

          // Chart-ready data for the stacked bar chart.
          // Each state is one bar; the four categories are its segments.
          chart_data: states.map((stateItem) => ({
            state: stateItem.state,

            college_of_medicine:
              stateItem.health_training_institutions['College of Medicine'],

            nursing_midwifery:
              stateItem.health_training_institutions[
                'Schools of Nursing and Midwifery'
              ],

            health_technology:
              stateItem.health_training_institutions[
                'Schools of Health Technology'
              ],

            pharmacy:
              stateItem.health_training_institutions[
                'Schools of Pharmacy'
              ],
          })),
        };
      },
    );

    // --------------------------------------------------
    // 6. Calculate national summary across all six zones.
    // --------------------------------------------------
    const summary = zonalData.reduce(
      (total, item) => ({
        total_hrh: total.total_hrh + item.summary.total_hrh,

        total_population:
          total.total_population + item.summary.total_population,

        total_training_institutions:
          total.total_training_institutions +
          item.summary.total_training_institutions,

        total_admission_quota:
          total.total_admission_quota +
          item.summary.total_admission_quota,
      }),
      {
        total_hrh: 0,
        total_population: 0,
        total_training_institutions: 0,
        total_admission_quota: 0,
      },
    );

    // --------------------------------------------------
    // 7. Group health training institutions by zone,
    //    then by institution category.
    // --------------------------------------------------
    const healthTrainingInstitutionsByZone = Object.fromEntries(
      zonalData.map((zoneItem) => {
        const categories = Object.fromEntries(
          trainingInstitutionCategories.map((category) => {
            const states = zoneItem.states.map((stateItem) => ({
              state: stateItem.state,
              total:
                stateItem.health_training_institutions[category],
            }));

            const total = states.reduce(
              (sum, item) => sum + item.total,
              0,
            );

            return [
              category,
              {
                total,
                states,
              },
            ];
          }),
        );

        return [zoneItem.zone, categories];
      }),
    );

    // --------------------------------------------------
    // 8. Return the complete national, zonal and state data.
    // --------------------------------------------------
    return {
      year: yearNum,

      summary: {
        ...summary,

        hrh_density:
          summary.total_population > 0
            ? Number(
              (
                (summary.total_hrh / summary.total_population) *
                10000
              ).toFixed(2),
            )
            : null,
      },

      zones: zonalData,

      trend,

      // Admission quota grouped by state.
      admission_quota: Object.fromEntries(
        zonalData.flatMap((item) =>
          item.states.map((stateItem) => [
            stateItem.state,
            stateItem.admission_quota,
          ]),
        ),
      ),

      // Health training institutions grouped by zone and category.
      health_training_institutions:
        healthTrainingInstitutionsByZone,
    };
  }

}
