-- DropForeignKey
ALTER TABLE "ProcessStepUser" DROP CONSTRAINT "ProcessStepUser_processStepId_fkey";

-- AddForeignKey
ALTER TABLE "ProcessStepUser" ADD CONSTRAINT "ProcessStepUser_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
