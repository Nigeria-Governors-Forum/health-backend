-- CreateTable
CREATE TABLE "public"."Flagship_Project" (
    "id" SERIAL NOT NULL,
    "zone" TEXT,
    "state" TEXT,
    "year" INTEGER,
    "flagship_Project" TEXT,
    "description" TEXT,

    CONSTRAINT "Flagship_Project_pkey" PRIMARY KEY ("id")
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
