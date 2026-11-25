-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Demography" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "indicator" TEXT,
    "value" INTEGER,
    "category_1" TEXT,
    "category_2" TEXT,

    CONSTRAINT "Demography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Demography_LGA" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "lga" TEXT,
    "lga_population" DOUBLE PRECISION,
    "number_of_wards" INTEGER,
    "hard_to_reach_wards" INTEGER,
    "hard_to_reach_colour" TEXT,
    "health_facilities" INTEGER,
    "density" INTEGER,

    CONSTRAINT "Demography_LGA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Health_Facilities" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "indicator" TEXT,
    "level" TEXT,
    "ownership" TEXT,
    "value" INTEGER,
    "state_population" INTEGER,

    CONSTRAINT "Health_Facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Health_Fac_Service_Provision" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "service_provision" TEXT,
    "number" INTEGER,
    "percentage" DOUBLE PRECISION,

    CONSTRAINT "Health_Fac_Service_Provision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HRH" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "indicator" TEXT,
    "values" INTEGER,
    "density" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,

    CONSTRAINT "HRH_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Health_Training_Institutions" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "institution" TEXT,
    "ownership" TEXT,
    "value" INTEGER,

    CONSTRAINT "Health_Training_Institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admission_Quota" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "indicator" TEXT,
    "faculty" TEXT,
    "value" INTEGER,

    CONSTRAINT "Admission_Quota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Insurance_Coverage" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "indicator" TEXT,
    "enrollee_type" TEXT,
    "value" INTEGER,

    CONSTRAINT "Insurance_Coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Scorecards" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "name" TEXT,
    "indicator" TEXT,
    "value" TEXT,
    "round" TEXT,

    CONSTRAINT "Scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Access_Service_Utilization" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "calendar_year" INTEGER,
    "data_year" TEXT,
    "page" TEXT,
    "indicator" TEXT,
    "source" TEXT,
    "value" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,

    CONSTRAINT "Access_Service_Utilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Health_Outcomes" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "calendar_year" INTEGER,
    "data_year" TEXT,
    "page" TEXT,
    "indicator" TEXT,
    "source" TEXT,
    "value" DOUBLE PRECISION,
    "target" DOUBLE PRECISION,

    CONSTRAINT "Health_Outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."health_fin" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "category" TEXT,
    "indicator" TEXT,
    "expenditure_type" TEXT,
    "program_classification" TEXT,
    "value" DOUBLE PRECISION,

    CONSTRAINT "health_fin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Partners_Mapping" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "partner" TEXT,
    "intervention_area" TEXT,
    "coverage_area" TEXT,

    CONSTRAINT "Partners_Mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flagship_Project" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "project" TEXT,
    "description" TEXT,

    CONSTRAINT "Flagship_Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NDHS" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "category" TEXT,
    "indicator" TEXT,
    "value" DOUBLE PRECISION,
    "source" TEXT,

    CONSTRAINT "NDHS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LGA_Per_Capita" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "lga" TEXT,
    "population" DOUBLE PRECISION,
    "per_capita" INTEGER,
    "indicator" TEXT,
    "budget" DOUBLE PRECISION,

    CONSTRAINT "LGA_Per_Capita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Presidential_Indicators" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "indicator" TEXT,
    "value" INTEGER,

    CONSTRAINT "Presidential_Indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Threat_Vulnerability_Assessment" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "risk" TEXT,
    "primary_threats" TEXT,
    "hotspots_lga" TEXT,

    CONSTRAINT "Threat_Vulnerability_Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Threat_Vulnerability_LGA" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "lga" TEXT,
    "risk" TEXT,
    "primary_threats" TEXT,

    CONSTRAINT "Threat_Vulnerability_LGA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
