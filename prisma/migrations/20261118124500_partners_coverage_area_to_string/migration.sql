ALTER TABLE "public"."Partners_Mapping"
ALTER COLUMN "coverage_area" SET DATA TYPE TEXT
USING "coverage_area"::TEXT;
