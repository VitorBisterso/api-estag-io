import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { isUserACompany } from 'src/opportunities/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProcessStepDto,
  UpdateProcessStepDto,
} from './dto';
import { isDeadlineValid } from 'src/opportunities/helpers';

@Injectable()
export class ProcessStepsService {
  constructor(private prisma: PrismaService) {}

  async getProcessSteps(
    opportunityId: number,
    user: Record<string, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        'Only companies can view process steps from an opportunity',
      );

    try {
      await this.prisma.opportunity.findUniqueOrThrow(
        {
          where: {
            id: opportunityId,
          },
        },
      );
    } catch (error) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        console.log('err', error);
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Opportunity with id ${opportunityId} not found`,
          );
        }
      }
      throw error;
    }

    return this.prisma.processStep.findMany({
      where: {
        opportunityId,
      },
      include: {
        applicants: true,
      },
    });
  }

  async createProcessStep(
    opportunityId: number,
    processSteps: Array<CreateProcessStepDto>,
    user: Record<string, any>,
  ) {
    if (
      !processSteps ||
      !Array.isArray(processSteps) ||
      processSteps.length <= 0
    )
      throw new UnprocessableEntityException(
        'You have to submit some steps to create them',
      );

    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        'Only companies can create process steps',
      );

    const opportunity =
      await this.prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },
      });

    if (!opportunity)
      throw new NotFoundException(
        `Opportunity with id ${opportunityId} not found`,
      );

    const steps = await Promise.all(
      processSteps.map(async (processStep) => {
        const { applicants: applicantsIds } =
          processStep;

        let applicants: User[];
        if (applicantsIds) {
          applicants = await Promise.all(
            applicantsIds.map(
              async (applicantId) => {
                const user =
                  await this.prisma.user.findUnique(
                    {
                      where: {
                        id: applicantId,
                      },
                    },
                  );

                if (!user)
                  throw new NotFoundException(
                    `User with id ${applicantId} not found`,
                  );

                return user;
              },
            ),
          );
        }

        if (
          !isDeadlineValid(processStep.deadline)
        )
          throw new UnprocessableEntityException(
            'A deadline must be a date in the future',
          );

        return {
          ...processStep,
          opportunityId,
          deadline: new Date(
            processStep.deadline,
          ),
          applicants,
        };
      }),
    );

    await this.prisma.processStep.createMany({
      data: steps,
    });
  }

  async updateProcessSteps(
    opportunityId: number,
    processSteps: Array<UpdateProcessStepDto>,
    user: Record<string, any>,
  ) {
    if (
      !processSteps ||
      !Array.isArray(processSteps) ||
      processSteps.length <= 0
    )
      throw new UnprocessableEntityException(
        'You have to submit some steps to update them',
      );

    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        'Only companies can update process steps',
      );

    const opportunity =
      await this.prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },
      });

    if (!opportunity)
      throw new NotFoundException(
        `Opportunity with id ${opportunityId} not found`,
      );

    const steps = await Promise.all(
      processSteps.map(async (processStep) => {
        const {
          id,
          newApplicants,
          removedApplicants,
        } = processStep;

        if (!id)
          throw new UnprocessableEntityException(
            'You must pass the steps ids',
          );

        const step =
          await this.prisma.processStep.findUnique(
            {
              where: {
                id,
              },
              include: {
                applicants: true,
              },
            },
          );

        if (!step)
          throw new NotFoundException(
            `Step with id ${id} not found`,
          );

        if (
          processStep.deadline &&
          !isDeadlineValid(processStep.deadline)
        )
          throw new UnprocessableEntityException(
            'A deadline must be a date in the future',
          );

        delete step.opportunityId;
        const newDeadline = processStep.deadline
          ? new Date(processStep.deadline)
          : step.deadline;

        if (removedApplicants) {
          removedApplicants.forEach(
            (applicantId) => {
              const applicantIndex =
                step.applicants.findIndex(
                  (applicant) =>
                    applicant.id === applicantId,
                );
              step.applicants.splice(
                applicantIndex,
                1,
              );
            },
          );
        }

        if (newApplicants) {
          await Promise.all(
            newApplicants.map(
              async (applicantId) => {
                const user =
                  await this.prisma.user.findUnique(
                    {
                      where: {
                        id: applicantId,
                      },
                    },
                  );

                if (!user)
                  throw new NotFoundException(
                    `User with id ${applicantId} not found`,
                  );

                step.applicants.push(user);
              },
            ),
          );
        }

        delete processStep.removedApplicants;
        delete processStep.newApplicants;

        return {
          ...processStep,
          applicants: step.applicants,
          deadline: newDeadline,
        };
      }),
    );

    const operations = steps.map((step) =>
      this.prisma.processStep.update({
        where: {
          id: step.id,
        },
        data: {
          ...step,
          applicants: {
            set: step.applicants.map(
              (applicant) => ({
                id: applicant.id,
              }),
            ),
          },
        },
      }),
    );

    return this.prisma.$transaction(operations);
  }

  async deleteProcessStep(
    processStepId: number,
    user: Record<any, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        'Only companies can delete process steps',
      );

    const processStep =
      await this.prisma.processStep.findUnique({
        where: {
          id: processStepId,
        },
      });

    if (!processStep)
      throw new NotFoundException(
        `Process step with id ${processStepId} not found`,
      );

    return this.prisma.processStep.delete({
      where: {
        id: processStepId,
      },
    });
  }
}
