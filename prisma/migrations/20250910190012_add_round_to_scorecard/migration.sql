/*
  Warnings:

  - The `year` column on the `Scorecards` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Scorecards" ADD COLUMN     "round" TEXT,
DROP COLUMN "year",
ADD COLUMN     "year" INTEGER;
