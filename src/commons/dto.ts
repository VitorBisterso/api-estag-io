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
import { getStringMessage } from 'src/utils/messages';

export type DIRECTION_ORDER = 'asc' | 'desc';

export class Paginated<T> {
  @ApiProperty({
    description: 'The current page',
    default: FIRST_PAGE,
    required: false,
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
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) =>
    toNumber(value, {
      default: PAGE_SIZE,
    }),
  )
  size: number = PAGE_SIZE;

  @ApiProperty({
    description: 'The sort criteria',
    example: 'name',
    required: false,
  })
  @IsString({
    message: getStringMessage('orderBy'),
  })
  @IsOptional()
  orderBy?: keyof T;

  @ApiProperty({
    description: 'The order direction',
    example: 'asc | desc',
    default: 'asc',
    required: false,
  })
  @IsString({
    message: getStringMessage('direction'),
  })
  @IsOptional()
  direction: DIRECTION_ORDER = 'asc';
}
