import { ApiProperty } from '@nestjs/swagger';
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
    description: 'The reviewed company id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  companyId: number;
}
