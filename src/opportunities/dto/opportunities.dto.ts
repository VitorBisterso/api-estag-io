import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsCurrency,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Paginated } from 'src/commons/dto';
import { toBoolean, toNumber } from 'src/utils';
import {
  getDateStringMessage,
  getRequiredMessage,
  getStringMessage,
} from 'src/utils/messages';

export type OPPORTUNITY_TYPE = 'REMOTE' | 'LOCAL';

export class OpportunityDto {
  @ApiProperty({
    description: 'The opportunity title',
    example: 'Vaga de estágio de desenvolvimento',
  })
  @IsString({
    message: getStringMessage('title'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('title'),
  })
  title: string;

  @ApiProperty({
    description: 'The opportunity description',
    example:
      'Quer fazer parte de uma empresa que...',
  })
  @IsString({
    message: getStringMessage('description'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('description'),
  })
  description: string;

  @ApiProperty({
    description: 'The opportunity type',
    example: 'REMOTE | LOCAL',
  })
  @IsString({
    message: getStringMessage('type'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('type'),
  })
  type: OPPORTUNITY_TYPE;

  @ApiProperty({
    description: 'The company name',
    example: 'Sensedia',
  })
  @IsString({
    message: getStringMessage('companyName'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('companyName'),
  })
  companyName: string;

  @ApiProperty({
    description: 'The opportunity salary',
    example: '2000,00',
  })
  @IsCurrency()
  @IsNotEmpty({
    message: getRequiredMessage('salary'),
  })
  salary: string;

  @ApiProperty({
    description:
      'The opportunity registration deadline',
    example: '2023-08-13',
  })
  @IsDateString(undefined, {
    message: getDateStringMessage('deadline'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('deadline'),
  })
  deadline: string;

  @ApiProperty({
    description:
      'The opportunity weekly workload',
    example: 30,
  })
  @IsNumber()
  @IsNotEmpty({
    message: getRequiredMessage('weeklyWorkload'),
  })
  weeklyWorkload: number;

  @ApiProperty({
    description:
      'If the opportunity is visible to students',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty({
    message: getRequiredMessage('isActive'),
  })
  isActive: boolean;
}

export class OpportunityFilterDto extends Paginated<OpportunityDto> {
  @ApiProperty({
    description: 'The opportunity title',
    example: 'Vaga de estágio de desenvolvimento',
    required: false,
  })
  @IsString({
    message: getStringMessage('title'),
  })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The opportunity type',
    example: 'REMOTE | LOCAL',
    required: false,
  })
  @IsString({
    message: getStringMessage('type'),
  })
  @IsOptional()
  type?: OPPORTUNITY_TYPE;

  @ApiProperty({
    description:
      'The opportunity weekly workload',
    example: 30,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  weeklyWorkload?: number;

  @ApiProperty({
    description:
      'Show only opportunities that I am registered to (only works for type "USER")',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  registeredOnly = false;

  @ApiProperty({
    description:
      'If the opportunity is visible to students',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  isActive = true;
}
