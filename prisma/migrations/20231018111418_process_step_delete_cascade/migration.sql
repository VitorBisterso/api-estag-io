-- DropForeignKey
ALTER TABLE "ProcessStep" DROP CONSTRAINT "ProcessStep_opportunityId_fkey";

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
