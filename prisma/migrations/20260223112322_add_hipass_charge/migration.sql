-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "hipassCharge" INTEGER;

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "branchCode" DROP DEFAULT,
ALTER COLUMN "branchName" DROP DEFAULT,
ALTER COLUMN "fuelType" DROP DEFAULT;
