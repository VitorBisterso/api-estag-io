import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  ReviewDto,
  ReviewFilterDto,
} from './dto';
import { GetUser } from 'src/auth/decorator';
import { Response as Res } from 'express';
import { isUserACompany } from 'src/opportunities/helpers';

@UseGuards(JwtGuard)
@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private reviewsService: ReviewsService,
  ) {}

  @ApiOperation({ summary: 'Get reviews' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Return all reviews with pagination and the total in the content-range header',
    type: ReviewDto,
    isArray: true,
  })
  @Get()
  getReviews(
    @Query() filter: ReviewFilterDto,
    @GetUser() user: Record<string, any>,
    @Response() res: Res,
  ) {
    const isCompany = isUserACompany(user);
    return this.reviewsService
      .getReviews(
        filter,
        isCompany ? 'COMPANY' : 'USER',
        user.id,
      )
      .then((reviews) =>
        res
          .set({
            'Content-Range': reviews.length,
          })
          .json({ reviews }),
      );
  }

  @ApiOperation({
    summary: 'Create a review',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @Post()
  createReview(
    @Body() review: CreateReviewDto,
    @GetUser() user: Record<string, any>,
    @Response() res: Res,
  ) {
    return this.reviewsService
      .createReview(review, user)
      .then(() =>
        res.sendStatus(HttpStatus.NO_CONTENT),
      );
  }
}
