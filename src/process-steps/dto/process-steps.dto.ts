import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class GetProcessStepsDto {
  @ApiProperty({
    description: 'The process step title',
    example: 'Entrevista com RH',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The process step description',
    example: 'Nesta etapa, o candidato...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The process step deadline',
    example: '2023-08-13',
  })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @ApiProperty({
    description:
      'If the deadline is the actual date of this step',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  onlyOnDeadline: boolean;

  @ApiProperty({
    description: 'The applicants',
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  applicants: Array<any>;
}

export class CreateProcessStepDto {
  @ApiProperty({
    description: 'The process step title',
    example: 'Entrevista com RH',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The process step description',
    example: 'Nesta etapa, o candidato...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The process step deadline',
    example: '2023-08-13',
  })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @ApiProperty({
    description:
      'If the deadline is the actual date of this step',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  onlyOnDeadline: boolean;

  @ApiProperty({
    description: 'The applicants ids',
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  applicants: Array<number>;
}
