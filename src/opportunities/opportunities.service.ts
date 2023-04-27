import { Injectable } from '@nestjs/common';
import { USER_TYPE } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpportunityFilterDto } from './dto';

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
}
