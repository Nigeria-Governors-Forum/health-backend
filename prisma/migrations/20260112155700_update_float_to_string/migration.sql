/*
  Warnings:

  - The `target` column on the `Access_Service_Utilization` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Access_Service_Utilization" DROP COLUMN "target",
ADD COLUMN     "target" DOUBLE PRECISION;
