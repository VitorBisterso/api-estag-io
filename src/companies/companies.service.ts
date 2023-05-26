import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyFilterDto } from './dto';
import { isUserACompany } from 'src/opportunities/helpers';

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
        include: {
          reviews: true,
        },
      });

    return companies.map((c) => {
      delete c.password;
      return c;
    });
  }
}
