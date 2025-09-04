/*
  Warnings:

  - You are about to alter the column `value` on the `HFin_1` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `value` on the `HFin_2` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."HFin_1" ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."HFin_2" ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION;
