import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateReviewDto,
  ReviewFilterDto,
} from './dto';
import { USER_TYPE } from 'src/auth/dto';
import { isUserACompany } from 'src/opportunities/helpers';
import {
  getForbiddenMessage,
  getNotFoundMessage,
} from 'src/utils/messages';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getReviews(
    filter: ReviewFilterDto,
    userType: USER_TYPE,
    userId: number,
  ) {
    if (userType !== 'COMPANY')
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    const {
      page,
      size,
      orderBy,
      direction,
      description,
    } = filter;

    const filters: Record<any, any> = {
      description: {
        contains: description,
      },
      companyId: { equals: userId },
    };

    const { _count: count } =
      await this.prisma.review.aggregate({
        _count: {
          id: true,
        },
      });

    const reviews =
      await this.prisma.review.findMany({
        skip: (page - 1) * size,
        take: size,
        where: filters,
        orderBy: {
          [orderBy || 'createdAt']: direction,
        },
        include: {
          student: true,
        },
      });

    return { reviews, count: count.id };
  }

  async createReview(
    review: CreateReviewDto,
    user: Record<string, any>,
  ) {
    if (isUserACompany(user))
      throw new ForbiddenException(
        getForbiddenMessage(),
      );

    if (review.rating < 1 || review.rating > 5)
      throw new UnprocessableEntityException(
        'A nota deve ser um número inteiro entre 1 e 5',
      );

    const company =
      await this.prisma.company.findUnique({
        where: {
          id: review.companyId,
        },
      });

    if (!company)
      throw new NotFoundException(
        getNotFoundMessage(
          'Empresa',
          review.companyId.toString(),
        ),
      );

    const createReview =
      this.prisma.review.create({
        data: {
          ...review,
          studentId: user.id,
          companyId: review.companyId,
        },
      });

    const { _sum, _count } =
      await this.prisma.review.aggregate({
        where: {
          companyId: review.companyId,
        },
        _sum: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });

    const newRating =
      (Number(_sum.rating ?? 0) + review.rating) /
      (_count.rating + 1);

    const updateCompanyRating =
      this.prisma.company.update({
        where: {
          id: review.companyId,
        },
        data: {
          rating: newRating,
        },
      });

    await this.prisma.$transaction([
      createReview,
      updateCompanyRating,
    ]);
  }
}
