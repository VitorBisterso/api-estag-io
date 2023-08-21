import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { isUserACompany } from 'src/opportunities/helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProcessStepDto,
  UpdateProcessStepDto,
} from './dto';
import { isDeadlineValid } from 'src/opportunities/helpers';
import {
  getDeadlineDateMessage,
  getForbiddenMessage,
  getNotFoundMessage,
} from 'src/utils/messages';

@Injectable()
export class ProcessStepsService {
  constructor(private prisma: PrismaService) {}

  async getProcessSteps(
    opportunityId: number,
    user: Record<string, any>,
  ) {
    const opportunity =
      await this.prisma.opportunity.findUniqueOrThrow(
        {
          where: {
            id: opportunityId,
          },
        },
      );

    if (!opportunity)
      throw new NotFoundException(
        getNotFoundMessage(
          'Vaga',
          'id',
          opportunityId.toString(),
        ),
      );

    const isCompany = isUserACompany(user);
    if (!isCompany) {
      const steps =
        await this.prisma.processStep.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            deadline: true,
            onlyOnDeadline: true,
            applicants: {
              select: {
                id: true,
              },
            },
          },
          where: {
            opportunityId,
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

      return steps.map((step) => ({
        ...step,
        applicants: undefined,
        isApplied: step.applicants.some(
          (applicant) => applicant.id,
        ),
      }));
    }

    if (opportunity.companyId !== user.id)
      throw new NotFoundException(
        getNotFoundMessage(
          'Vaga',
          'id',
          opportunityId.toString(),
        ),
      );

    return this.prisma.processStep.findMany({
      where: {
        opportunityId,
      },
      include: {
        applicants: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createProcessStep(
    opportunityId: number,
    processStep: CreateProcessStepDto,
    user: Record<string, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    const opportunity =
      await this.prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },
        include: {
          applicants: true,
        },
      });

    if (!opportunity)
      throw new NotFoundException(
        getNotFoundMessage(
          'Vaga',
          'id',
          opportunityId.toString(),
        ),
      );

    let { applicants: applicantsIds } =
      processStep;

    if (processStep.everyone) {
      applicantsIds = opportunity.applicants.map(
        (applicant) => applicant.userId,
      );
    }

    if (applicantsIds) {
      await Promise.all(
        applicantsIds.map(async (applicantId) => {
          const user =
            await this.prisma.user.findUnique({
              where: {
                id: applicantId,
              },
            });

          if (!user)
            throw new NotFoundException(
              getNotFoundMessage(
                'Estudante',
                'id',
                applicantId.toString(),
              ),
            );

          return user;
        }),
      );
    }

    if (!isDeadlineValid(processStep.deadline))
      throw new UnprocessableEntityException(
        getDeadlineDateMessage(),
      );

    delete processStep.everyone;
    delete processStep.applicants;

    await this.prisma.processStep.create({
      data: {
        ...processStep,
        opportunityId,
        deadline: new Date(processStep.deadline),
        applicants: {
          connect: applicantsIds.map((id) => ({
            id,
          })),
        },
      },
    });
  }

  async updateProcessSteps(
    processStepId: number,
    processStep: UpdateProcessStepDto,
    user: Record<string, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    const step =
      await this.prisma.processStep.findUnique({
        where: {
          id: processStepId,
        },
        include: {
          applicants: true,
        },
      });

    if (!step)
      throw new NotFoundException(
        getNotFoundMessage(
          'Passo',
          'id',
          processStepId.toString(),
        ),
      );

    if (
      processStep.deadline &&
      !isDeadlineValid(processStep.deadline)
    )
      throw new UnprocessableEntityException(
        getDeadlineDateMessage(),
      );

    const newDeadline = processStep.deadline
      ? new Date(processStep.deadline)
      : step.deadline;

    const { newApplicants, removedApplicants } =
      processStep;

    return this.prisma.processStep.update({
      where: {
        id: processStepId,
      },
      data: {
        title: processStep.title,
        description: processStep.description,
        deadline: newDeadline,
        onlyOnDeadline:
          processStep.onlyOnDeadline,
        applicants: {
          connect: newApplicants.map((id) => ({
            id,
          })),
          disconnect: removedApplicants.map(
            (id) => ({ id }),
          ),
        },
      },
    });
  }

  async deleteProcessStep(
    processStepId: number,
    user: Record<any, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    const processStep =
      await this.prisma.processStep.findUnique({
        where: {
          id: processStepId,
        },
      });

    if (!processStep)
      throw new NotFoundException(
        getNotFoundMessage(
          'Passo',
          'id',
          processStepId.toString(),
        ),
      );

    return this.prisma.processStep.delete({
      where: {
        id: processStepId,
      },
    });
  }
}
