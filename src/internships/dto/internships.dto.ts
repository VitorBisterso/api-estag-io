import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuthUserDto } from 'src/auth/dto';
import { Paginated } from 'src/commons/dto';
import {
  OPPORTUNITY_TYPE,
  OpportunityDto,
} from 'src/opportunities/dto';
import { toNumber } from 'src/utils';
import {
  getDateStringMessage,
  getRequiredMessage,
  getStringMessage,
} from 'src/utils/messages';

export class InternshipDto {
  @ApiProperty({
    description:
      'The first day of the internship',
    example: '2023-08-13',
  })
  @IsDateString(undefined, {
    message:
      'O campo "initialDate" deve ser uma string no formato "YYYY-MM-DD"',
  })
  @IsNotEmpty({
    message: getRequiredMessage('initialDate'),
  })
  initialDate: string;

  @ApiProperty({
    description: 'The last day of the internship',
    example: '2024-02-13',
  })
  @IsDateString(undefined, {
    message: getDateStringMessage('until'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('until'),
  })
  until: string;

  @ApiProperty({
    description: "The intern manager's name",
    example: 'Abel Ferreira',
  })
  @IsString({
    message: getStringMessage('managerName'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('managerName'),
  })
  managerName: string;

  @ApiProperty({
    description: 'The student',
    type: AuthUserDto,
  })
  @IsObject()
  @IsNotEmpty({
    message: getRequiredMessage('student'),
  })
  student: AuthUserDto;

  @ApiProperty({
    description: 'The job and its info',
    type: OpportunityDto,
  })
  @IsObject()
  @IsNotEmpty({
    message: getRequiredMessage('job'),
  })
  job: OpportunityDto;
}

export class InternshipFilterDto extends Paginated<InternshipDto> {
  @ApiProperty({
    description: "The intern's name",
    example: 'Raphael Veiga',
    required: false,
  })
  @IsString({
    message: getStringMessage('internName'),
  })
  @IsOptional()
  internName?: string;

  @ApiProperty({
    description: 'The internship type',
    example: 'REMOTE | LOCAL',
    required: false,
  })
  @IsString({
    message: getStringMessage('type'),
  })
  @IsOptional()
  type?: OPPORTUNITY_TYPE;

  @ApiProperty({
    description: 'The internship weekly workload',
    example: 30,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  weeklyWorkload?: number;
}

export class CreateInternshipDto {
  @ApiProperty({
    description:
      'The first day of the internship',
    example: '2023-08-13',
  })
  @IsDateString(undefined, {
    message: getDateStringMessage('initialDate'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('initialDate'),
  })
  initialDate: string;

  @ApiProperty({
    description: 'The last day of the internship',
    example: '2024-02-13',
  })
  @IsDateString(undefined, {
    message: getDateStringMessage('until'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('until'),
  })
  until: string;

  @ApiProperty({
    description: "The intern manager's name",
    example: 'Abel Ferreira',
  })
  @IsString({
    message: getStringMessage('managerName'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('managerName'),
  })
  managerName: string;

  @ApiProperty({
    description: 'The student id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({
    message: getRequiredMessage('studentId'),
  })
  studentId: number;

  @ApiProperty({
    description: 'The opportunity id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({
    message: getRequiredMessage('jobId'),
  })
  jobId: number;
}

export class UpdateInternshipDto {
  @ApiProperty({
    description:
      'The first day of the internship',
    example: '2023-08-13',
  })
  @IsDateString(undefined, {
    message: getDateStringMessage('initialDate'),
  })
  @IsOptional()
  initialDate?: string;

  @ApiProperty({
    description: 'The last day of the internship',
    example: '2024-02-13',
  })
  @IsDateString(undefined, {
    message: getDateStringMessage('until'),
  })
  @IsOptional()
  until?: string;

  @ApiProperty({
    description: "The intern manager's name",
    example: 'Abel Ferreira',
  })
  @IsString({
    message: getStringMessage('managerName'),
  })
  @IsOptional()
  managerName?: string;

  @ApiProperty({
    description: 'The opportunity id',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  jobId?: number;
}
