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

export type OPPORTUNITY_TYPE = 'REMOTE' | 'LOCAL';

export class OpportunityDto {
  @ApiProperty({
    description: 'The opportunity title',
    example: 'Vaga de estágio de desenvolvimento',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The opportunity description',
    example:
      'Quer fazer parte de uma empresa que...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The opportunity type',
    example: 'REMOTE | LOCAL',
  })
  @IsString()
  @IsNotEmpty()
  type: OPPORTUNITY_TYPE;

  @ApiProperty({
    description: 'The opportunity salary',
    example: '2000,00',
  })
  @IsCurrency()
  @IsNotEmpty()
  salary: string;

  @ApiProperty({
    description:
      'The opportunity registration deadline',
    example: '2023-08-13',
  })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @ApiProperty({
    description:
      'The opportunity weekly workload',
    example: 30,
  })
  @IsNumber()
  @IsNotEmpty()
  weeklyWorkload: number;

  @ApiProperty({
    description:
      'If the opportunity is visible to students',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

export class OpportunityFilterDto extends Paginated<OpportunityDto> {
  @ApiProperty({
    description: 'The opportunity title',
    example: 'Vaga de estágio de desenvolvimento',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The opportunity type',
    example: 'REMOTE | LOCAL',
    required: false,
  })
  @IsString()
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

// export class ProccessStepDto {
//   @ApiProperty({
//     description: 'The proccess step title',
//     example: 'Entrevista com o RH',
//   })
//   @IsString()
//   @IsNotEmpty()
//   title: string;

//   @ApiProperty({
//     description: 'The proccess step description',
//     example: 'Nesta etapa, o candidato...',
//   })
//   @IsString()
//   @IsNotEmpty()
//   description: string;

//   @ApiProperty({
//     example: '2024-01-01',
//     description: 'The process step deadline',
//   })
//   @IsDateString()
//   @IsNotEmpty()
//   deadline: string;

//   @ApiProperty({
//     description:
//       'If the proccess step is actually on the deadline and NOT until then',
//   })
//   @IsBoolean()
//   @IsNotEmpty()
//   @Transform(({ value }) => toBoolean(value))
//   onlyOnDeadline: boolean;

//   @ApiProperty({
//     description:
//       'The applicants ids that will take part on this proccess step',
//     isArray: true,
//     type: Array<number>,
//     example: [1, 2, 3],
//   })
//   @IsArray()
//   @IsNotEmpty()
//   @Transform(({ value: applicants }) =>
//     applicants.map((applicantId: string) =>
//       toNumber(applicantId),
//     ),
//   )
//   applicants: Array<number>;
// }

// export class UpdateOpportunityDto extends autoImplement<
//   Optional<OpportunityDto>
// >() {
//   @ApiProperty({
//     description: 'The opportunity process steps',
//     isArray: true,
//     type: Array<ProccessStepDto>,
//   })
//   @IsArray()
//   @IsNotEmpty()
//   processSteps: Array<ProccessStepDto>;
// }
