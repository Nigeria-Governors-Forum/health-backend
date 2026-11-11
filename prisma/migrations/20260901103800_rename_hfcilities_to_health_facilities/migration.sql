-- AlterTable
ALTER TABLE "HFcilities" RENAME TO "Health_Facilities";

-- AlterIndex
ALTER INDEX IF EXISTS "HFcilities_pkey" RENAME TO "Health_Facilities_pkey";
