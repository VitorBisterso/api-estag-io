import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  FIRST_PAGE,
  PAGE_SIZE,
} from 'src/consts';
import { toNumber } from 'src/utils';

export type DIRECTION_ORDER = 'ASC' | 'DESC';

export class Paginated<T> {
  @ApiProperty({
    description: 'The current page',
    default: FIRST_PAGE,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) =>
    toNumber(value, {
      default: FIRST_PAGE,
      min: FIRST_PAGE,
    }),
  )
  page: number = FIRST_PAGE;

  @ApiProperty({
    description: 'The page size',
    default: PAGE_SIZE,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) =>
    toNumber(value, {
      default: PAGE_SIZE,
      min: PAGE_SIZE,
    }),
  )
  size: number = PAGE_SIZE;

  @ApiProperty({
    description: 'The sort criteria',
    example: 'name',
  })
  @IsString()
  @IsOptional()
  sortBy?: keyof T;

  @ApiProperty({
    description: 'The sort order',
    example: 'ASC | DESC',
    default: 'ASC',
  })
  @IsString()
  @IsOptional()
  orderBy: DIRECTION_ORDER = 'ASC';
}
