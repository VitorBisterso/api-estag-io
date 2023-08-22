import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { USER_TYPE } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  OpportunityDto,
  OpportunityFilterDto,
} from './dto';
import {
  isDeadlineValid,
  isTypeValid,
  isUserACompany,
} from './helpers';
import { Prisma } from '@prisma/client';
import {
  getDeadlineDateMessage,
  getForbiddenMessage,
  getNotFoundMessage,
} from 'src/utils/messages';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async getOpportunities(
    filter: OpportunityFilterDto,
    userType: USER_TYPE,
    userId: number,
  ): Promise<{
    opportunities: Array<any>;
    count: number;
  }> {
    const isCompany = userType === 'COMPANY';

    const {
      page,
      size,
      orderBy,
      direction,
      title,
      type,
      weeklyWorkload,
      registeredOnly,
      isActive,
    } = filter;

    let filters: Record<any, any> = {
      title: {
        contains: title,
      },
      type: {
        equals: type,
      },
      weeklyWorkload: {
        equals: weeklyWorkload,
      },
      isActive: {
        equals: isCompany ? isActive : true,
      },
    };

    if (isCompany) {
      filters = {
        ...filters,
        companyId: { equals: userId },
      };
    }

    const { _count: count } =
      await this.prisma.opportunity.aggregate({
        _count: {
          id: true,
        },
      });

    const opportunities =
      await this.prisma.opportunity.findMany({
        skip: (page - 1) * size,
        take: size,
        where: filters,
        orderBy: {
          [orderBy || 'title']: direction,
        },
        include: {
          applicants: true,
          company: !isCompany,
        },
      });

    if (isCompany)
      return {
        opportunities,
        count: count.id,
      };

    let filteredOpportunities = opportunities;
    if (registeredOnly) {
      filteredOpportunities =
        opportunities.filter((opportunity) =>
          opportunity.applicants.some(
            (applicant) =>
              applicant.userId === userId,
          ),
        );
    }

    const withoutUnauthorizedFields =
      filteredOpportunities.map((opportunity) => {
        delete opportunity.isActive;
        delete opportunity.applicants;

        const companyName =
          opportunity.company.name;
        delete opportunity.company;

        return {
          ...opportunity,
          companyName,
        };
      });

    return {
      opportunities: withoutUnauthorizedFields,
      count: count.id,
    };
  }

  async getSimplifiedOpportunities(
    user: Record<string, any>,
  ) {
    if (!isUserACompany(user))
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    return this.prisma.opportunity.findMany({
      where: {
        companyId: user.id,
      },
      select: {
        id: true,
        title: true,
      },
    });
  }

  async getOpportunityById(
    opportunityId: number,
    userType: USER_TYPE,
    userId: number,
  ) {
    const isCompany = userType === 'COMPANY';

    const opportunity =
      await this.prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },
        include: {
          applicants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          company: !isCompany,
        },
      });

    const notFoundMessage = getNotFoundMessage(
      'Vaga',
      'id',
      opportunityId.toString(),
    );

    if (!opportunity)
      throw new NotFoundException(
        notFoundMessage,
      );

    if (!isCompany && !opportunity.isActive)
      throw new NotFoundException(
        notFoundMessage,
      );

    if (
      isCompany &&
      opportunity.companyId !== userId
    )
      throw new NotFoundException(
        notFoundMessage,
      );

    const applicants = opportunity.applicants.map(
      (applicant) => applicant.user,
    );
    if (isCompany)
      return { ...opportunity, applicants };

    const companyName = opportunity.company?.name;
    delete opportunity.company;

    const isApplied = opportunity.applicants
      .map((applicant) => applicant.userId)
      .includes(userId);

    delete opportunity.isActive;
    delete opportunity.applicants;
    return {
      ...opportunity,
      companyName,
      isApplied,
    };
  }

  async createOpportunity(
    opportunity: OpportunityDto,
    user: Record<string, any>,
  ) {
    if (!isUserACompany(user))
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    if (!isTypeValid(opportunity.type))
      throw new BadRequestException(
        'O tipo da oportunidade deve ser "LOCAL" ou "REMOTA"',
      );

    if (opportunity.weeklyWorkload <= 0)
      throw new BadGatewayException(
        'A carga semanal deve ser um número inteiro positivo',
      );

    if (Number(opportunity.salary) <= 0)
      throw new BadGatewayException(
        'O salário deve ser um número positivo',
      );

    if (!isDeadlineValid(opportunity.deadline))
      throw new BadRequestException(
        getDeadlineDateMessage(),
      );

    const createdOpportunity =
      await this.prisma.opportunity.create({
        data: {
          ...opportunity,
          deadline: new Date(
            opportunity.deadline,
          ),
          companyId: user.id,
        },
      });

    return createdOpportunity;
  }

  async updateOpportunity(
    id: number,
    opportunity: Partial<OpportunityDto>,
    user: Record<string, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    try {
      await this.prisma.opportunity.findUniqueOrThrow(
        {
          where: {
            id,
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
            getNotFoundMessage(
              'Vaga',
              'id',
              id.toString(),
            ),
          );
        }
      }
      throw error;
    }

    return this.prisma.opportunity.update({
      where: {
        id,
      },
      data: opportunity,
    });
  }

  async deleteOpportunity(
    id: number,
    user: Record<string, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (!isCompany)
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    try {
      await this.prisma.opportunity.findUniqueOrThrow(
        {
          where: {
            id,
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
            getNotFoundMessage(
              'Vaga',
              'id',
              id.toString(),
            ),
          );
        }
      }
      throw error;
    }

    return this.prisma.opportunity.delete({
      where: {
        id,
      },
    });
  }

  async applyForOpportunity(
    opportunityId: number,
    user: Record<any, any>,
  ) {
    const isCompany = isUserACompany(user);

    if (isCompany)
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

    if (!opportunity || !opportunity.isActive)
      throw new NotFoundException(
        getNotFoundMessage(
          'Vaga',
          'id',
          opportunityId.toString(),
        ),
      );

    const hasApplied =
      opportunity.applicants.some(
        (applicant) =>
          applicant.userId === user.id,
      );
    if (hasApplied)
      throw new UnprocessableEntityException(
        'Você já está aplicado a essa vaga',
      );

    return this.prisma.opportunityUser.create({
      data: {
        userId: user.id,
        opportunityId: opportunity.id,
      },
    });
  }
}
