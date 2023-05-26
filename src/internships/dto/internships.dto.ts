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

export class InternshipDto {
  @ApiProperty({
    description:
      'The first day of the internship',
    example: '2023-08-13',
  })
  @IsDateString()
  @IsNotEmpty()
  initialDate: string;

  @ApiProperty({
    description: 'The last day of the internship',
    example: '2024-02-13',
  })
  @IsDateString()
  @IsNotEmpty()
  until: string;

  @ApiProperty({
    description: "The intern manager's name",
    example: 'Abel Ferreira',
  })
  @IsString()
  @IsNotEmpty()
  managerName: string;

  @ApiProperty({
    description: 'The student',
    type: AuthUserDto,
  })
  @IsObject()
  @IsNotEmpty()
  student: AuthUserDto;

  @ApiProperty({
    description: 'The job and its info',
    type: OpportunityDto,
  })
  @IsObject()
  @IsNotEmpty()
  job: OpportunityDto;
}

export class InternshipFilterDto extends Paginated<InternshipDto> {
  @ApiProperty({
    description: "The intern's name",
    example: 'Rafael Veiga',
    required: false,
  })
  @IsString()
  @IsOptional()
  internName?: string;

  @ApiProperty({
    description: 'The internship type',
    example: 'REMOTE | LOCAL',
    required: false,
  })
  @IsString()
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
  @IsDateString()
  @IsNotEmpty()
  initialDate: string;

  @ApiProperty({
    description: 'The last day of the internship',
    example: '2024-02-13',
  })
  @IsDateString()
  @IsNotEmpty()
  until: string;

  @ApiProperty({
    description: "The intern manager's name",
    example: 'Abel Ferreira',
  })
  @IsString()
  @IsNotEmpty()
  managerName: string;

  @ApiProperty({
    description: 'The student id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({
    description: 'The opportunity id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  jobId: number;
}

export class UpdateInternshipDto {
  @ApiProperty({
    description:
      'The first day of the internship',
    example: '2023-08-13',
  })
  @IsDateString()
  @IsOptional()
  initialDate?: string;

  @ApiProperty({
    description: 'The last day of the internship',
    example: '2024-02-13',
  })
  @IsDateString()
  @IsOptional()
  until?: string;

  @ApiProperty({
    description: "The intern manager's name",
    example: 'Abel Ferreira',
  })
  @IsString()
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
