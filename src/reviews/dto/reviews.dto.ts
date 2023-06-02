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

export class ReviewDto {
  @ApiProperty({
    description: 'The review title',
    example: 'Minha avaliação da empresa X',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The review description',
    example:
      'Eu acho que o processo com essa empresa...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'The student that posted the review',
    type: AuthUserDto,
  })
  @IsObject()
  @IsNotEmpty()
  student: AuthUserDto;

  @ApiProperty({
    description: 'The reviewed company',
    type: AuthCompanyDto,
  })
  @IsObject()
  @IsNotEmpty()
  company: AuthCompanyDto;
}

export class ReviewFilterDto extends Paginated<ReviewDto> {
  @ApiProperty({
    description: 'The review description',
    example:
      'Eu acho que o processo com essa empresa...',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateReviewDto {
  @ApiProperty({
    description: 'The review title',
    example: 'Minha avaliação da empresa X',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The review description',
    example:
      'Eu acho que o processo com essa empresa...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description:
      'The review rating (an integer between 1 and 5)',
    type: Number,
    example: DEFAULT_RATING,
    default: DEFAULT_RATING,
  })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => toNumber(value))
  rating: number;

  @ApiProperty({
    description: 'The reviewed company id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  companyId: number;
}
