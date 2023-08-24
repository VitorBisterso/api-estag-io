import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyFilterDto } from './dto';
import { isUserACompany } from 'src/opportunities/helpers';
import { USER_TYPE } from 'src/auth/dto';
import {
  getForbiddenMessage,
  getNotFoundMessage,
} from 'src/utils/messages';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getCompanies(
    filter: CompanyFilterDto,
    userType: Record<string, any>,
  ) {
    if (isUserACompany(userType))
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    const {
      page,
      size,
      orderBy,
      direction,
      name,
    } = filter;

    const { _count: count } =
      await this.prisma.company.aggregate({
        _count: {
          id: true,
        },
      });

    const companies =
      await this.prisma.company.findMany({
        skip: (page - 1) * size,
        take: size,
        where: {
          name: {
            contains: name,
          },
        },
        orderBy: {
          [orderBy || 'name']: direction,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          rating: true,
        },
      });

    return {
      companies,
      count: count.id,
    };
  }

  async getCompanyById(
    companyId: number,
    userType: USER_TYPE,
  ) {
    if (userType === 'COMPANY')
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    const company =
      await this.prisma.company.findUnique({
        where: {
          id: companyId,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          rating: true,
          reviews: {
            select: {
              id: true,
              title: true,
              description: true,
              rating: true,
              createdAt: true,
            },
            take: 5,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

    if (!company)
      throw new NotFoundException(
        getNotFoundMessage(
          'Empresa',
          'id',
          companyId.toString(),
        ),
      );

    const { _count: reviewCount } =
      await this.prisma.review.aggregate({
        _count: {
          id: true,
        },
        where: {
          companyId: companyId,
        },
      });
    return {
      ...company,
      reviewCount: reviewCount.id,
    };
  }
}
