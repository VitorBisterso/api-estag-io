/*
  Warnings:

  - Added the required column `isActive` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "isActive" BOOLEAN NOT NULL;
