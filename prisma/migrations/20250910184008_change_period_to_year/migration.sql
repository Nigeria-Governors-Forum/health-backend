/*
  Warnings:

  - You are about to drop the column `period` on the `Scorecards` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Scorecards" DROP COLUMN "period",
ADD COLUMN     "year" TEXT;
