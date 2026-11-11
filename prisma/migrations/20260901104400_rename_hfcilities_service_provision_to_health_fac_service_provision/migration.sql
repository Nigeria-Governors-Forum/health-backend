-- AlterTable
ALTER TABLE "HFcilities_Service_Provision" RENAME TO "Health_Fac_Service_Provision";

-- AlterIndex
ALTER INDEX IF EXISTS "HFcilities_Service_Provision_pkey" RENAME TO "Health_Fac_Service_Provision_pkey";
