/*
  Warnings:

  - You are about to drop the column `indicator` on the `LGA_PCap` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."LGA_PCap" DROP COLUMN "indicator",
ADD COLUMN     "budget" TEXT;
