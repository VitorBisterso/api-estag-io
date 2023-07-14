import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
} from 'class-validator';
import { AuthCompanyDto } from 'src/auth/dto';
import { Paginated } from 'src/commons/dto';
import { getStringMessage } from 'src/utils/messages';

export class CompanyFilterDto extends Paginated<AuthCompanyDto> {
  @ApiProperty({
    description: 'The company name',
    example: 'Sensedia',
    required: false,
  })
  @IsString({
    message: getStringMessage('name'),
  })
  @IsOptional()
  name?: string;
}
