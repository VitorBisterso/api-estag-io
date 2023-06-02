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
        'Only companies can view their own reviews',
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

    return reviews;
  }

  async createReview(
    review: CreateReviewDto,
    user: Record<string, any>,
  ) {
    if (isUserACompany(user))
      throw new ForbiddenException(
        'You cannot perform this operation',
      );

    if (review.rating < 1 || review.rating > 5)
      throw new UnprocessableEntityException(
        'Rating must be an integer between 0 and 5',
      );

    const company =
      await this.prisma.company.findUnique({
        where: {
          id: review.companyId,
        },
      });

    if (!company)
      throw new NotFoundException(
        `Company with id ${review.companyId} was not found`,
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
