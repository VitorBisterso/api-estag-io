import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  getDateStringMessage,
  getRequiredMessage,
  getStringMessage,
} from 'src/utils/messages';

export class GetProcessStepsDto {
  @ApiProperty({
    description: 'The process step title',
    example: 'Entrevista com RH',
  })
  @IsString({
    message: getStringMessage('title'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('title'),
  })
  title: string;

  @ApiProperty({
    description: 'The process step description',
    example: 'Nesta etapa, o candidato...',
  })
  @IsString({
    message: getStringMessage('description'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('description'),
  })
  description: string;

  @ApiProperty({
    description: 'The process step deadline',
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
      'If the deadline is the actual date of this step',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty({
    message: getRequiredMessage('onlyOnDeadline'),
  })
  onlyOnDeadline: boolean;

  @ApiProperty({
    description: 'The applicants',
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty({
    message: getRequiredMessage('applicants'),
  })
  applicants: Array<any>;
}

export class CreateProcessStepDto {
  @ApiProperty({
    description: 'The process step title',
    example: 'Entrevista com RH',
  })
  @IsString({
    message: getStringMessage('title'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('title'),
  })
  title: string;

  @ApiProperty({
    description: 'The process step description',
    example: 'Nesta etapa, o candidato...',
  })
  @IsString({
    message: getStringMessage('description'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('description'),
  })
  description: string;

  @ApiProperty({
    description: 'The process step deadline',
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
      'If the deadline is the actual date of this step',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty({
    message: getRequiredMessage('onlyOnDeadline'),
  })
  onlyOnDeadline: boolean;

  @ApiProperty({
    description: 'The applicants ids',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  applicants: Array<number> = [];

  @ApiProperty({
    description:
      'If every opportunity applicant will participate in this step',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  everyone = true;
}

export class UpdateProcessStepDto {
  @ApiProperty({
    description: 'The process step title',
    example: 'Entrevista com RH',
  })
  @IsString({
    message: getStringMessage('title'),
  })
  @IsOptional()
  title: string;

  @ApiProperty({
    description: 'The process step description',
    example: 'Nesta etapa, o candidato...',
  })
  @IsString({
    message: getStringMessage('description'),
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'The process step deadline',
    example: '2023-08-13',
  })
  @IsDateString(undefined, {
    message: getDateStringMessage('deadline'),
  })
  @IsOptional()
  deadline: string;

  @ApiProperty({
    description:
      'If the deadline is the actual date of this step',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  onlyOnDeadline: boolean;

  @ApiProperty({
    description: 'The added applicants ids',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  newApplicants?: Array<number>;

  @ApiProperty({
    description: 'The removed applicants ids',
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  removedApplicants?: Array<number>;
}
