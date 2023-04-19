import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  IsMobilePhone,
} from 'class-validator';

export type USER_TYPE = 'USER' | 'COMPANY';

export class AuthUserDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'The student email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The student password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Abel Ferreira',
    description: 'The student name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '2002-02-02',
    description: 'The student birthday',
  })
  @IsDateString()
  @IsNotEmpty()
  birthday: string;
}

export class AuthCompanyDto {
  @ApiProperty({
    example: '99999999000101',
    description: 'The company CNPJ',
  })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({
    example: 'company@email.com',
    description: 'The company email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The company password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Sensedia',
    description: 'The company name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '5519999665999',
    description: 'The company phone',
  })
  @IsMobilePhone('pt-BR')
  @IsNotEmpty()
  phone: string;
}

export class AuthSignInDto {
  @ApiProperty({
    example: 'email@email.com',
    description: 'The user email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The user password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'USER | COMPANY',
    description: 'The user type',
  })
  @IsString()
  @IsNotEmpty()
  userType: USER_TYPE;
}

export class SignInResponse {
  @ApiProperty({
    description: 'The access token',
  })
  accessToken: string;

  @ApiProperty({
    description: 'The refresh token',
  })
  refreshToken: string;
}
