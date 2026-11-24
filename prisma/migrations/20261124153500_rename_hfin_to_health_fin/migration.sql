-- RenameTable
ALTER TABLE "HFin" RENAME TO "health_fin";

-- RenameIndex
ALTER INDEX IF EXISTS "HFin_pkey" RENAME TO "health_fin_pkey";
