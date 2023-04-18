/*
  Warnings:

  - You are about to drop the column `cexApproverId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `cexApproverId` on the `Internship` table. All the data in the column will be lost.
  - You are about to drop the column `professorId` on the `Internship` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CEX` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CEXConfirmationStatusLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rating` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthday` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CompanyField" AS ENUM ('AUTOMOBILISTICO', 'BANCO', 'BENS_DE_CONSUMO', 'COMIDAS_BEBIDAS', 'EDUCACAO', 'EMPREITEIRA', 'FARMACEUTICO_QUIMICOS', 'HOSPITAL_PLANO_DE_SAUDE', 'INDUSTRIA', 'LOGISTICA', 'MIDIA_PROPAGANDA', 'ONG', 'PETROLEO_ENERGIA_AMBIENTAIS', 'SAUDE_BEM_ESTAR', 'SEGURADORA', 'SERVICOS_FINANCEIROS', 'VAREJO', 'TI_TELECOMUNICACOES');

-- DropForeignKey
ALTER TABLE "CEXConfirmationStatusLog" DROP CONSTRAINT "CEXConfirmationStatusLog_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_cexApproverId_fkey";

-- DropForeignKey
ALTER TABLE "Internship" DROP CONSTRAINT "Internship_cexApproverId_fkey";

-- DropForeignKey
ALTER TABLE "Internship" DROP CONSTRAINT "Internship_professorId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_guestId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_ownerId_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "cexApproverId",
DROP COLUMN "isApproved",
ADD COLUMN     "rating" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "Internship" DROP COLUMN "cexApproverId",
DROP COLUMN "professorId";

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "type",
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "CEX";

-- DropTable
DROP TABLE "CEXConfirmationStatusLog";

-- DropTable
DROP TABLE "Meeting";

-- DropEnum
DROP TYPE "ConfirmationStatus";

-- DropEnum
DROP TYPE "UserType";

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
