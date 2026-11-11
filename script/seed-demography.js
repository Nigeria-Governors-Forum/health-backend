const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

function parseYearCreated(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    if (val > 10000) {
      // Excel serial date number
      const d = new Date((val - 25569) * 86400 * 1000);
      return d.getFullYear();
    }
    return val; // e.g. 1991
  }
  const str = String(val).trim();
  const match = str.match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    return parseInt(match[1], 10);
  }
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

async function seedDemography() {
  console.log('🚀 Starting Demography seeding process...');

  const mainExcelPath = path.join(__dirname, '../NGF_Health_Dashboard_Data.xlsx');
  if (!fs.existsSync(mainExcelPath)) {
    throw new Error(`File not found: ${mainExcelPath}`);
  }

  console.log(`📖 Reading ${mainExcelPath}...`);
  const wb = XLSX.readFile(mainExcelPath);
  const sheet = wb.Sheets['Demography'];
  if (!sheet) {
    throw new Error('Sheet "Demography" not found in NGF_Health_Dashboard_Data.xlsx');
  }

  const rows = XLSX.utils.sheet_to_json(sheet);
  console.log(`📊 Found ${rows.length} rows in "Demography" sheet.`);

  // Clean existing Demography data to avoid stale duplicate records
  await prisma.demography.deleteMany({});
  console.log('🧹 Cleared existing Demography records from DB.');

  const demographyRecords = [];

  for (const r of rows) {
    const zone = r.Zone ? String(r.Zone).trim() : null;
    const state = r.State ? String(r.State).trim() : null;
    const year = r.Year ? parseInt(r.Year, 10) : null;
    const page = r.Section ? String(r.Section).trim() : 'Demography';
    const indicator = r.Indicator ? String(r.Indicator).trim() : null;
    let rawVal = r.Value;

    if (!indicator || !state) continue;

    let value = null;
    if (indicator === 'Year Created') {
      value = parseYearCreated(rawVal);
    } else if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      const parsed = parseFloat(rawVal);
      value = isNaN(parsed) ? null : Math.round(parsed);
    }

    const category_1 = r.Category_1 ? String(r.Category_1).trim() : null;
    const category_2 = r.Category_2 ? String(r.Category_2).trim() : null;

    demographyRecords.push({
      zone,
      state,
      year,
      page,
      indicator,
      value,
      category_1,
      category_2,
    });
  }

  console.log(`📥 Inserting ${demographyRecords.length} Demography records...`);
  // Bulk create in chunks of 500
  const chunkSize = 500;
  for (let i = 0; i < demographyRecords.length; i += chunkSize) {
    const chunk = demographyRecords.slice(i, i + chunkSize);
    await prisma.demography.createMany({ data: chunk });
  }
  console.log(`✅ Successfully seeded ${demographyRecords.length} Demography records!`);

  // Seed Demography_LGA if tab exists in main workbook or separate file
  let lgaRows = [];
  const lgaSheetName = wb.SheetNames.find((s) =>
    s.toLowerCase().replace(/\s+/g, '_').includes('demog') &&
    s.toLowerCase().includes('lga')
  );

  if (lgaSheetName) {
    console.log(`📖 Found LGA sheet "${lgaSheetName}" in workbook...`);
    lgaRows = XLSX.utils.sheet_to_json(wb.Sheets[lgaSheetName]);
  } else {
    const lgaExcelPaths = [path.join(__dirname, '../Demography_LGA.xlsx')];
    let lgaPath = lgaExcelPaths.find((p) => fs.existsSync(p));
    if (lgaPath) {
      console.log(`📖 Reading LGA data from file ${lgaPath}...`);
      const lgaWb = XLSX.readFile(lgaPath);
      lgaRows = XLSX.utils.sheet_to_json(lgaWb.Sheets[lgaWb.SheetNames[0]]);
    }
  }

  if (lgaRows.length > 0) {
    console.log(`📊 Found ${lgaRows.length} rows in LGA dataset.`);

    await prisma.demography_LGA.deleteMany({});
    console.log('🧹 Cleared existing Demography_LGA records.');

    function normalizeState(val) {
      if (!val) return null;
      let str = String(val).trim();
      if (str === 'FCT-Abuja' || str === 'Federal Capital Territory') return 'FCT';
      return str;
    }

    const lgaRecords = [];
    for (const r of lgaRows) {
      const year = r.Year || r.year ? parseInt(r.Year || r.year, 10) : null;
      if (!year || isNaN(year) || year < 2000 || year > 2100) continue;

      const state = normalizeState(r.State || r.state);
      const lga = r.LGA || r.lga ? String(r.LGA || r.lga).trim() : null;
      if (!state || !lga) continue;

      const rawPop = r.LGA_Population ?? r.lga_population;
      const rawWards = r.Number_of_Wards ?? r.number_of_wards;
      const rawFacilities = r.Health_Facilities ?? r.health_facilities;
      const rawHard =
        r.hard_to_reach_wards ??
        r.hard_to_reach_wards ??
        r.Hard_to_Reach_Colour ??
        r.hard_to_reach_colour ??
        r.Hard_to_Reach ??
        r.hard_to_reach;

      lgaRecords.push({
        zone: r.Zone || r.zone ? String(r.Zone || r.zone).trim() : null,
        state,
        year,
        page: r.Section || r.page ? String(r.Section || r.page).trim() : 'Demography',
        lga,
        lga_population:
          rawPop !== undefined && rawPop !== null && rawPop !== ''
            ? parseFloat(rawPop)
            : null,
        number_of_wards:
          rawWards !== undefined && rawWards !== null && rawWards !== ''
            ? parseInt(rawWards, 10)
            : null,
        hard_to_reach_wards: rawHard ? String(rawHard).trim() : 'No',
        health_facilities:
          rawFacilities !== undefined &&
          rawFacilities !== null &&
          rawFacilities !== ''
            ? parseInt(rawFacilities, 10)
            : null,
      });
    }

    for (let i = 0; i < lgaRecords.length; i += chunkSize) {
      const chunk = lgaRecords.slice(i, i + chunkSize);
      await prisma.demography_LGA.createMany({ data: chunk });
    }
    console.log(`✅ Successfully seeded ${lgaRecords.length} Demography_LGA records!`);
  }
}

seedDemography()
  .catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
