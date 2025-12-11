-- CreateTable
CREATE TABLE "public"."Admission_Quota" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "school" TEXT,
    "faculty" TEXT,
    "admission_quota" INTEGER,

    CONSTRAINT "Admission_Quota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LGA_Population" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "lga" TEXT,
    "population" DOUBLE PRECISION,
    "wards" INTEGER,
    "hard_To_Reach_Wards" INTEGER,
    "hard_To_Reach" TEXT,
    "nothing" TEXT,
    "health_Facilities" INTEGER,
    "density" INTEGER,

    CONSTRAINT "LGA_Population_pkey" PRIMARY KEY ("id")
);
