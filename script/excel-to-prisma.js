const fs = require("fs");
const XLSX = require("xlsx");

const filePath = "./data.xlsx";
const workbook = XLSX.readFile(filePath);

// Map JS value → Prisma type
function mapToPrismaType(value) {
  if (value === null || value === undefined) return "String";

  if (typeof value === "number") {
    if (Number.isInteger(value)) return "Int";
    return "Float";
  }
  if (typeof value === "boolean") return "Boolean";

  // Check if value looks like a date
  if (!isNaN(Date.parse(value))) return "DateTime";

  return "String";
}

let prismaModels = "";

// Loop through each sheet
for (const sheetName of workbook.SheetNames) {
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  if (!sheet.length) continue;

  const firstRow = sheet[0];
  const columns = Object.keys(firstRow);

  const fields = columns
    .map((col) => {
      const sample = firstRow[col];
      const type = mapToPrismaType(sample);
      const fieldName = col.replace(/\s+/g, "_").toLowerCase();
      return `  ${fieldName} ${type}?`; // Make all fields nullable
    })
    .join("\n");

  const modelName = sheetName.replace(/\s+/g, "_");

  prismaModels += `model ${modelName} {
  id Int @id @default(autoincrement())
${fields}
}\n\n`;
}

// Write schema.prisma
const schema = `
datasource db {
  provider = "postgresql" // or mysql/sqlite
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

${prismaModels}
`;

fs.writeFileSync("prisma/schema.prisma", schema);
console.log("✅ Prisma schema generated from all sheets with nullable fields");
