/*
  Warnings:

  - Added the required column `businessCategory` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('AUTOMOTIVE', 'BANK', 'CONSUMER_GOODS', 'FOOD_AND_BEVERAGES', 'EDUCATION', 'CONSTRUCTION_COMPANY', 'PHARMACEUTICAL_AND_CHEMICALS', 'HOSPITAL_AND_HEALTH_PLAN', 'INDUSTRY', 'LOGISTICS', 'MEDIA_AND_ADVERTISING', 'NGO', 'OIL_ENERGY_AND_ENVIRONMENTAL', 'HEALTH_AND_WELL_BEING', 'INSURANCE_COMPANY', 'FINANCIAL_SERVICES', 'RETAIL', 'IT_AND_TELECOMMUNICATIONS');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "businessCategory" "BusinessCategory";

-- Update current fields
UPDATE "Company" SET "businessCategory" = 'AUTOMOTIVE' where "businessCategory" IS NULL;

-- Make mandatory
ALTER TABLE "Company" ALTER COLUMN     "businessCategory" SET NOT NULL;

-- DropEnum
DROP TYPE "CompanyField";
