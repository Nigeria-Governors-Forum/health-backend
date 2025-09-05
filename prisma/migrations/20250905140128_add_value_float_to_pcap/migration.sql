/*
  Warnings:

  - The `budget` column on the `LGA_PCap` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."LGA_PCap" DROP COLUMN "budget",
ADD COLUMN     "budget" DOUBLE PRECISION;
