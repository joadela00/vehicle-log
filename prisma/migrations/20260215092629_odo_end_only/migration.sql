-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "odoStart" INTEGER,
    "odoEnd" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,
    "evRemainPct" INTEGER NOT NULL,
    "hipassBalance" INTEGER NOT NULL,
    "tollCost" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("createdAt", "date", "distance", "driverId", "evRemainPct", "hipassBalance", "id", "note", "odoEnd", "odoStart", "tollCost", "vehicleId") SELECT "createdAt", "date", "distance", "driverId", "evRemainPct", "hipassBalance", "id", "note", "odoEnd", "odoStart", "tollCost", "vehicleId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
