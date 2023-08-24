import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  AuthCompanyDto,
  AuthUserDto,
} from 'src/auth/dto';
import { Paginated } from 'src/commons/dto';
import { DEFAULT_RATING } from 'src/consts';
import { toNumber } from 'src/utils';
import {
  getRequiredMessage,
  getStringMessage,
} from 'src/utils/messages';

export class ReviewDto {
  @ApiProperty({
    description: 'The review description',
    example:
      'Eu acho que o processo com essa empresa...',
  })
  @IsString({
    message: getStringMessage('description'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('description'),
  })
  description: string;

  @ApiProperty({
    description:
      'The student that posted the review',
    type: AuthUserDto,
  })
  @IsObject()
  @IsNotEmpty({
    message: getRequiredMessage('student'),
  })
  student: AuthUserDto;

  @ApiProperty({
    description: 'The reviewed company',
    type: AuthCompanyDto,
  })
  @IsObject()
  @IsNotEmpty({
    message: getRequiredMessage('company'),
  })
  company: AuthCompanyDto;
}

export class ReviewFilterDto extends Paginated<ReviewDto> {
  @ApiProperty({
    description: 'The review description',
    example:
      'Eu acho que o processo com essa empresa...',
    required: false,
  })
  @IsString({
    message: getStringMessage('description'),
  })
  @IsOptional()
  description?: string;
}

export class CreateReviewDto {
  @ApiProperty({
    description: 'The review description',
    example:
      'Eu acho que o processo com essa empresa...',
  })
  @IsString({
    message: getStringMessage('description'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('description'),
  })
  description: string;

  @ApiProperty({
    description:
      'The review rating (an integer between 1 and 5)',
    type: Number,
    example: DEFAULT_RATING,
    default: DEFAULT_RATING,
  })
  @IsNumber()
  @IsNotEmpty({
    message: getRequiredMessage('rating'),
  })
  @Transform(({ value }) => toNumber(value))
  rating: number;

  @ApiProperty({
    description: 'The reviewed company id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({
    message: getRequiredMessage('companyId'),
  })
  @Transform(({ value }) => toNumber(value))
  companyId: number;
}
