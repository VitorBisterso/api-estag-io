/*
  Warnings:

  - You are about to drop the `ProcessStepUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProcessStepUser" DROP CONSTRAINT "ProcessStepUser_processStepId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessStepUser" DROP CONSTRAINT "ProcessStepUser_userId_fkey";

-- DropTable
DROP TABLE "ProcessStepUser";

-- CreateTable
CREATE TABLE "_ProcessStepToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProcessStepToUser_AB_unique" ON "_ProcessStepToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProcessStepToUser_B_index" ON "_ProcessStepToUser"("B");

-- AddForeignKey
ALTER TABLE "_ProcessStepToUser" ADD CONSTRAINT "_ProcessStepToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcessStepToUser" ADD CONSTRAINT "_ProcessStepToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
