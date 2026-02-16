-- Speed up /trips filtering and ordering paths
CREATE INDEX "Trip_date_createdAt_idx" ON "Trip"("date", "createdAt");
CREATE INDEX "Trip_vehicleId_date_createdAt_idx" ON "Trip"("vehicleId", "date", "createdAt");
