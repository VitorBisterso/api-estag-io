import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { isUserACompany } from 'src/opportunities/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProcessStepDto } from './dto';

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
}
