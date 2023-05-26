import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
} from 'class-validator';
import { AuthCompanyDto } from 'src/auth/dto';
import { Paginated } from 'src/commons/dto';

export class CompanyFilterDto extends Paginated<AuthCompanyDto> {
  @ApiProperty({
    description: 'The company name',
    example: 'Sensedia',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
