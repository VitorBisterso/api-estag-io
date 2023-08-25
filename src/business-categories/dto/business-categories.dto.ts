import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BusinessCategoryDto {
  @ApiProperty({
    description:
      'A company business category label',
    example: 'Automobilístico',
  })
  @IsString()
  label: string;

  @ApiProperty({
    description:
      'A company business category value',
    example: 'AUTOMOTIVE',
  })
  @IsString()
  value: string;
}
