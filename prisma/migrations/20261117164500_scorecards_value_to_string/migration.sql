ALTER TABLE "public"."Scorecards"
ALTER COLUMN "value" SET DATA TYPE TEXT
USING "value"::TEXT;
