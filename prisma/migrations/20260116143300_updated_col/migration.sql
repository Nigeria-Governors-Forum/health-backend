/*
  Warnings:

  - You are about to drop the column `flagship_Project` on the `Flagship_Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Flagship_Project" DROP COLUMN "flagship_Project",
ADD COLUMN     "project" TEXT;
