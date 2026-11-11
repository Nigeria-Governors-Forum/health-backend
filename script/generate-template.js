const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// Date conversion helper
function excelDateToYear(excelDate) {
  if (typeof excelDate === "number") {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.getFullYear();
  }
  // Try to parse string dates if any
  const parsed = Date.parse(excelDate);
  if (!isNaN(parsed)) {
    return new Date(parsed).getFullYear();
  }
  return null;
}

function main() {
  const sourcePath = path.join(__dirname, "../data.xlsx");
  const outputPath = path.join(__dirname, "../health_data_template.xlsx");

  let sourceWorkbook;
  try {
    sourceWorkbook = XLSX.readFile(sourcePath);
    console.log("📖 Read existing data.xlsx successfully.");
  } catch (err) {
    console.log("⚠️ Could not read existing data.xlsx. Creating template from scratch.");
  }

  const targetWorkbook = XLSX.utils.book_new();

  // All 21 sheets required by the application
  const requiredSheets = [
    "Demography",
    "Partners_Mapping",
    "Demography_LGA",
    "Health_Facilities",
    "Health_Fac_Service_Provision",
    "Health_Training_Institutions",
    "HRH",
    "Insurance_Coverage",
    "Access_Service_Utilization",
    "Health_Outcomes",
    "NDHS",
    "HFin",
    "HFin_2",
    "Per_Capita",
    "LGA_Fin",
    "LGA_PCap",
    "Scorecards",
    "Admission_Quota",
    "Flagship_Project",
    "Presidential_Indicators",
    "LGA_Population"
  ];

  // Helper to extract or generate rows for a sheet
  for (const sheetName of requiredSheets) {
    let rows = [];

    // If sheet exists in sourceWorkbook, copy and adjust
    if (sourceWorkbook && sourceWorkbook.SheetNames.includes(sheetName)) {
      const sourceRows = XLSX.utils.sheet_to_json(sourceWorkbook.Sheets[sheetName]);
      
      if (sheetName === "Scorecards") {
        // Special mapping for Scorecards: split Period into Year and Round
        rows = sourceRows.map(row => {
          const newRow = {};
          
          // Copy all columns except Period
          for (const key of Object.keys(row)) {
            if (key !== "Period") {
              newRow[key] = row[key];
            }
          }

          // Parse Period into Round and Year
          const periodVal = row["Period"];
          if (periodVal) {
            if (typeof periodVal === "string" && periodVal.toLowerCase().includes("round")) {
              newRow["Round"] = periodVal;
              newRow["Year"] = 2023; // Default year for sample if it only has round name
            } else {
              const yearVal = excelDateToYear(periodVal);
              newRow["Year"] = yearVal || 2023;
              newRow["Round"] = "Round 1"; // Default round if it only had a year/date
            }
          } else {
            newRow["Year"] = 2023;
            newRow["Round"] = "Round 1";
          }

          // Ensure columns order
          return {
            Zone: newRow.Zone || "South East",
            State: newRow.State || "Abia",
            Name: newRow.Name || "Nutrition",
            Year: newRow.Year,
            Round: newRow.Round,
            Indicator: newRow.Indicator || "Quarterly SCFN Meetings",
            Status: newRow.Status || "No",
            Value: newRow.Value ?? 0
          };
        });
      } else {
        // Just copy rows directly
        rows = sourceRows;
      }
    } else {
      // Sheet is missing, generate appropriate headers & sample rows
      if (sheetName === "Admission_Quota") {
        rows = [
          {
            Zone: "South East",
            State: "Abia",
            Year: 2023,
            School: "Abia State University",
            Faculty: "Medicine",
            Admission_Quota: 100
          },
          {
            Zone: "North Central",
            State: "Benue",
            Year: 2023,
            School: "Benue State University",
            Faculty: "Nursing",
            Admission_Quota: 50
          }
        ];
      } else if (sheetName === "Flagship_Project") {
        rows = [
          {
            Zone: "South East",
            State: "Abia",
            Year: 2023,
            Project: "Strengthening Primary Health Care Systems",
            Description: "Upgrade PHC facilities, equip with essential medicines, and strengthen community health workforce."
          },
          {
            Zone: "North Central",
            State: "Benue",
            Year: 2023,
            Project: "Maternal and Child Health Acceleration",
            Description: "Expand antenatal, delivery, postnatal and child health services with nutrition support."
          }
        ];
      } else if (sheetName === "Presidential_Indicators") {
        rows = [
          {
            Zone: "South East",
            State: "Abia",
            Year: 2023,
            Indicator: "Under-5 Mortality Rate",
            Value: 50
          },
          {
            Zone: "North Central",
            State: "Benue",
            Year: 2023,
            Indicator: "Maternal Mortality Ratio",
            Value: 350
          }
        ];
      } else if (sheetName === "LGA_Population") {
        rows = [
          {
            Zone: "South East",
            State: "Abia",
            Year: 2023,
            LGA: "Aba North",
            Population: 169066.5,
            Wards: 12,
            Hard_To_Reach_Wards: 2,
            Hard_To_Reach: "No",
            Health_Facilities: 78,
            Density: 1400
          },
          {
            Zone: "North Central",
            State: "Benue",
            Year: 2023,
            LGA: "Makurdi",
            Population: 300000.0,
            Wards: 11,
            Hard_To_Reach_Wards: 0,
            Hard_To_Reach: "No",
            Health_Facilities: 45,
            Density: 1800
          }
        ];
      }
    }

    if (rows.length === 0) {
      // Add empty header row to prevent xlsx crash if there are no rows
      console.warn(`⚠️ Sheet ${sheetName} has no rows. Skipping.`);
      continue;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(targetWorkbook, worksheet, sheetName);
    console.log(`✅ Added sheet: ${sheetName} with ${rows.length} rows.`);
  }

  XLSX.writeFile(targetWorkbook, outputPath);
  console.log(`🎉 Unified Excel template successfully created at: ${outputPath}`);
}

main();
