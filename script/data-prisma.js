const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");

const prisma = new PrismaClient();
const filePath = "./data.xlsx";
const workbook = XLSX.readFile(filePath);

async function main() {
  for (const sheetName of workbook.SheetNames) {
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (!sheet.length) continue;

    const modelName = sheetName.replace(/\s+/g, "_").toLowerCase(); // Prisma model name

    for (const row of sheet) {
      const data = {};
      for (const key of Object.keys(row)) {
        const fieldName = key.replace(/\s+/g, "_").toLowerCase();
        let value = row[key];

        // Replace undefined/null/empty values with null or "N/A"
        if (value === undefined || value === null || value === "") {
          value = null; // or use "N/A" if you prefer
        }

        data[fieldName] = value;
      }

      try {
        await prisma[modelName].create({ data });
      } catch (err) {
        console.error(`⚠ Failed to insert into ${modelName}:`, err.message);
        // Continue to next row even if this one fails
      }
    }
    console.log(`✅ Finished inserting data for sheet: ${sheetName}`);
  }
}

main()
  .then(() => {
    console.log("🎉 All sheets processed!");
  })
  .catch((err) => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
