ALTER TABLE "Vehicle"
  ADD COLUMN "branchCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "branchName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "fuelType" TEXT NOT NULL DEFAULT '';

CREATE INDEX "Vehicle_branchCode_plate_idx" ON "Vehicle"("branchCode", "plate");
