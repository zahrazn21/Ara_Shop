-- CreateEnum
CREATE TYPE "VolumeUnit" AS ENUM ('ML', 'G', 'OZ', 'PCS');

-- CreateEnum
CREATE TYPE "SkinType" AS ENUM ('NORMAL', 'DRY', 'OILY', 'COMBINATION', 'SENSITIVE', 'ALL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('WOMEN', 'MEN', 'UNISEX');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "trackingCode" TEXT;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "colorHex" TEXT,
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "healthLicense" TEXT,
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "paoMonths" INTEGER,
ADD COLUMN     "skinTypes" "SkinType"[] DEFAULT ARRAY[]::"SkinType"[],
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "usage" TEXT,
ADD COLUMN     "volume" DOUBLE PRECISION,
ADD COLUMN     "volumeUnit" "VolumeUnit",
ADD COLUMN     "warnings" TEXT;
