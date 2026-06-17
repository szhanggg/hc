-- CreateTable
CREATE TABLE "Need" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "quantityFulfilled" INTEGER NOT NULL DEFAULT 0,
    "unitCost" REAL NOT NULL,
    "daysOpen" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "linkedPatientId" TEXT,
    "description" TEXT,
    "volunteerBlurb" TEXT
);
