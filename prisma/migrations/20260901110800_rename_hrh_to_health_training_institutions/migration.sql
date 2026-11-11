-- AlterTable
ALTER TABLE "HRH" RENAME TO "Health_Training_Institutions";

-- AlterIndex
ALTER INDEX IF EXISTS "HRH_pkey" RENAME TO "Health_Training_Institutions_pkey";
