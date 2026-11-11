const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

function parseNumericValue(val, isFloat = false) {
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

function excelDateToYear(excelDate) {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.getFullYear();
}

async function uploadHealthTrainingInstitutions(filePath) {
  console.log(`📖 Reading ${filePath} ...`);
  const workbook = XLSX.readFile(filePath);

  let targetSheetName = workbook.SheetNames.find(
    (name) => {
      const norm = name.toLowerCase().replace(/\s+/g, '_');
      return (
        norm === 'health_training_institutions' ||
        norm === 'hrh'
      );
    }
  );

  if (!targetSheetName) {
    console.error('❌ Could not find Health_Training_Institutions sheet. Available:', workbook.SheetNames);
    return;
  }

  console.log(`🔍 Found sheet: "${targetSheetName}"`);
  const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[targetSheetName]);
  console.log(`📊 Total rows in sheet: ${sheetData.length}`);

  const uniqueFields = ['state', 'year', 'institution', 'ownership'];
  const validFieldsSet = new Set(['id', 'zone', 'state', 'year', 'page', 'institution', 'ownership', 'value']);

  console.log('🔄 Fetching existing Health_Training_Institutions records from DB...');
  const existingRecords = await prisma.health_Training_Institutions.findMany();
  console.log(`ℹ️ Existing records count in DB: ${existingRecords.length}`);

  const existingMap = new Map();
  for (const rec of existingRecords) {
    const compositeKey = uniqueFields
      .map((f) => String(rec[f] ?? '').toLowerCase().trim())
      .join('|');
    existingMap.set(compositeKey, rec);
  }

  const toCreate = [];
  const toUpdate = [];
  let skippedCount = 0;

  for (const row of sheetData) {
    const sanitized = {};
    for (const key of Object.keys(row)) {
      let fieldName = key.replace(/\s+/g, '_').toLowerCase();
      let value = row[key];

      if (fieldName === 'state' && value !== undefined && value !== null) {
        value = String(value).trim();
        if (value === 'FCT-Abuja' || value === 'Federal Capital Territory') {
          value = 'FCT';
        }
      }

      if (fieldName === 'year' && value !== undefined && value !== null) {
        const parsedYr = parseInt(String(value), 10);
        value = isNaN(parsedYr) ? null : parsedYr;
      }

      if (fieldName === 'period' && value) {
        sanitized.year = excelDateToYear(value);
        continue;
      }

      if (fieldName === 'value') {
        value = parseNumericValue(value, false);
      }

      if (fieldName === 'section') fieldName = 'page';

      sanitized[fieldName] = value;
    }

    // Map Indicator -> institution if not already set
    if (!sanitized.institution && (row['Indicator'] || row['indicator'] || row['Institution'] || row['institution'])) {
      sanitized.institution = String(row['Indicator'] || row['indicator'] || row['Institution'] || row['institution']).trim();
    }

    for (const key of Object.keys(sanitized)) {
      if (!validFieldsSet.has(key) || key === 'id') {
        delete sanitized[key];
      }
    }

    if (
      sanitized.year === null ||
      sanitized.year === undefined ||
      isNaN(sanitized.year) ||
      sanitized.year < 1900 ||
      sanitized.year > 2100 ||
      !sanitized.institution
    ) {
      skippedCount++;
      continue;
    }

    const compositeKey = uniqueFields
      .map((f) => String(sanitized[f] ?? '').toLowerCase().trim())
      .join('|');
    const existing = existingMap.get(compositeKey);

    if (!existing) {
      toCreate.push(sanitized);
    } else {
      const isSame = Object.keys(sanitized).every((k) => {
        const sVal = sanitized[k];
        const eVal = existing[k];
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
  }

  console.log(`📋 Rows to create: ${toCreate.length}`);
  console.log(`📋 Rows to update: ${toUpdate.length}`);
  console.log(`📋 Rows skipped: ${skippedCount}`);

  if (toCreate.length > 0) {
    const chunkSize = 100;
    for (let i = 0; i < toCreate.length; i += chunkSize) {
      const chunk = toCreate.slice(i, i + chunkSize);
      await prisma.health_Training_Institutions.createMany({ data: chunk });
    }
    console.log(`✅ Bulk created ${toCreate.length} rows`);
  }

  if (toUpdate.length > 0) {
    const chunkSize = 10;
    for (let i = 0; i < toUpdate.length; i += chunkSize) {
      const chunk = toUpdate.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((item) =>
          prisma.health_Training_Institutions.update({
            where: item.where,
            data: item.data,
          })
        )
      );
    }
    console.log(`✅ Bulk updated ${toUpdate.length} rows`);
  }

  const finalCount = await prisma.health_Training_Institutions.count();
  console.log(`🎉 Done! Total Health_Training_Institutions records in database: ${finalCount}`);
}

async function main() {
  const filePath = process.argv[2] || path.join(__dirname, '..', 'NGF_Health_Dashboard_Data.xlsx');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  await uploadHealthTrainingInstitutions(filePath);
}

main()
  .catch((e) => {
    console.error('❌ Error during upload:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
