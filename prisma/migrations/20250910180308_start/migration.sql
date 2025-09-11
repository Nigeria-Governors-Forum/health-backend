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

    CONSTRAINT "Demography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Partners_Mapping" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "partner" TEXT,
    "intervention_group_correct" TEXT,
    "coverage_area" INTEGER,

    CONSTRAINT "Partners_Mapping_pkey" PRIMARY KEY ("id")
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
    "hard_to_reach_lgas" TEXT,
    "health_facilities" INTEGER,

    CONSTRAINT "Demography_LGA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HFcilities" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "indicator" TEXT,
    "level" TEXT,
    "ownership" TEXT,
    "value" INTEGER,

    CONSTRAINT "HFcilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HFcilities_Service_Provision" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "service_provision" TEXT,
    "number" INTEGER,
    "percentage" DOUBLE PRECISION,

    CONSTRAINT "HFcilities_Service_Provision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HRH" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "institution" TEXT,
    "ownership" TEXT,
    "value" INTEGER,

    CONSTRAINT "HRH_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HRH_Professions" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "institution" TEXT,
    "number" INTEGER,
    "density" DOUBLE PRECISION,

    CONSTRAINT "HRH_Professions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Insurance_Coverage" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "name" TEXT,
    "indicator" TEXT,
    "value" INTEGER,

    CONSTRAINT "Insurance_Coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Access_Service_Utilization" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "indicator" TEXT,
    "source" TEXT,
    "value" DOUBLE PRECISION,

    CONSTRAINT "Access_Service_Utilization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Health_Outcomes" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "page" TEXT,
    "indicator" TEXT,
    "value" INTEGER,

    CONSTRAINT "Health_Outcomes_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."HFin_1" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "category" TEXT,
    "indicator" TEXT,
    "exp_type" TEXT,
    "status" TEXT,
    "value" DOUBLE PRECISION,

    CONSTRAINT "HFin_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HFin_2" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "category" TEXT,
    "indicator" TEXT,
    "exp_type" TEXT,
    "status" TEXT,
    "value" DOUBLE PRECISION,

    CONSTRAINT "HFin_2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Per_Capita" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "health_exp" DOUBLE PRECISION,
    "state_population" DOUBLE PRECISION,
    "per_capita" DOUBLE PRECISION,

    CONSTRAINT "Per_Capita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LGA_Fin" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "lga" TEXT,
    "indicator" TEXT,
    "exp_type" TEXT,
    "status" TEXT,
    "value" DOUBLE PRECISION,

    CONSTRAINT "LGA_Fin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LGA_PCap" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "lga" TEXT,
    "population" DOUBLE PRECISION,
    "per_capita" INTEGER,
    "indicator" TEXT,
    "budget" DOUBLE PRECISION,

    CONSTRAINT "LGA_PCap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Scorecards" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "name" TEXT,
    "period" TIMESTAMP(3),
    "indicator" TEXT,
    "status" TEXT,
    "value" INTEGER,

    CONSTRAINT "Scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
