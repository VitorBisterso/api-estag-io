import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { USER_TYPE } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  OpportunityDto,
  OpportunityFilterDto,
} from './dto';
import {
  isTypeValid,
  isUserACompany,
} from './helpers';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async getOpportunities(
    filter: OpportunityFilterDto,
    userType: USER_TYPE,
    userId: number,
  ) {
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
        equals: isActive,
      },
    };

    if (userType === 'COMPANY') {
      filters = {
        ...filters,
        companyId: { equals: userId },
      };
    }

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
        },
      });

    if (userType === 'USER') {
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
        filteredOpportunities.map(
          (opportunity) => {
            delete opportunity.isActive;
            delete opportunity.applicants;
          },
        );

      return withoutUnauthorizedFields;
    }

    return opportunities;
  }

  async createOpportunity(
    opportunity: OpportunityDto,
    user: Record<string, any>,
  ) {
    if (!isUserACompany(user))
      throw new ForbiddenException(
        'You cannot perform this operation',
      );

    if (!isTypeValid(opportunity.type))
      throw new BadRequestException(
        'Opportunity type must be either "LOCAL" or "REMOTE"',
      );

    if (opportunity.weeklyWorkload <= 0)
      throw new BadGatewayException(
        'Weekly workload must be a positive number',
      );

    if (Number(opportunity.salary) <= 0)
      throw new BadGatewayException(
        'Salary must be a positive number',
      );

    const deadline = new Date(
      opportunity.deadline,
    );
    if (deadline.getTime() < new Date().getTime())
      throw new BadRequestException(
        'A deadline must be a date in the future',
      );

    const createdOpportunity =
      await this.prisma.opportunity.create({
        data: {
          ...opportunity,
          deadline,
          companyId: user.id,
        },
      });

    return createdOpportunity;
  }
}
