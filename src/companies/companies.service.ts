import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyFilterDto } from './dto';
import { isUserACompany } from 'src/opportunities/helpers';
import { USER_TYPE } from 'src/auth/dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getCompanies(
    filter: CompanyFilterDto,
    userType: Record<string, any>,
  ) {
    if (isUserACompany(userType))
      throw new ForbiddenException(
        'Only users can view all companies',
      );

    const {
      page,
      size,
      orderBy,
      direction,
      name,
    } = filter;

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
      });

    return companies.map((c) => {
      delete c.password;
      return c;
    });
  }

  async getCompanyById(
    companyId: number,
    userType: USER_TYPE,
  ) {
    if (userType === 'COMPANY')
      throw new ForbiddenException(
        'Only users can view another company',
      );

    const company =
      await this.prisma.company.findUnique({
        where: {
          id: companyId,
        },
        include: {
          reviews: true,
        },
      });

    if (!company)
      throw new NotFoundException(
        `Company with id ${companyId} not found`,
      );

    delete company.password;
    return company;
  }
}
