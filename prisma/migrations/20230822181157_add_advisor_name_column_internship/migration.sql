/*
  Warnings:

  - Made the column `rating` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `advisorName` to the `Internship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 5.0;

-- AlterTable
ALTER TABLE "Internship" ADD COLUMN     "advisorName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "rating" DROP DEFAULT;
