import { ApiProperty } from '@nestjs/swagger';
import { BusinessCategory } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  IsMobilePhone,
} from 'class-validator';
import { JwtPayload } from 'jwt-decode';
import {
  getDateStringMessage,
  getRequiredMessage,
  getStringMessage,
} from 'src/utils/messages';

export type USER_TYPE = 'USER' | 'COMPANY';

export class AuthUserDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'The student email',
  })
  @IsEmail(undefined, {
    message: 'Email inválido',
  })
  @IsNotEmpty({
    message: getRequiredMessage('email'),
  })
  email: string;

  @ApiProperty({
    description: 'The student password',
  })
  @IsString({
    message: getStringMessage('password'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('password'),
  })
  password: string;

  @ApiProperty({
    example: 'Abel Ferreira',
    description: 'The student name',
  })
  @IsString({
    message: getStringMessage('name'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('name'),
  })
  name: string;

  @ApiProperty({
    example: '2002-02-02',
    description: 'The student birthday',
  })
  @IsDateString(undefined, {
    message: getDateStringMessage('birthday'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('birthday'),
  })
  birthday: string;
}

export class AuthCompanyDto {
  @ApiProperty({
    example: '99999999000101',
    description: 'The company CNPJ',
  })
  @IsString({
    message: getStringMessage('cnpj'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('cnpj'),
  })
  cnpj: string;

  @ApiProperty({
    example: 'company@email.com',
    description: 'The company email',
  })
  @IsEmail(undefined, {
    message: 'Email inválido',
  })
  @IsNotEmpty({
    message: getRequiredMessage('email'),
  })
  email: string;

  @ApiProperty({
    description: 'The company password',
  })
  @IsString({
    message: getStringMessage('password'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('password'),
  })
  password: string;

  @ApiProperty({
    example: 'Sensedia',
    description: 'The company name',
  })
  @IsString({
    message: getStringMessage('name'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('name'),
  })
  name: string;

  @ApiProperty({
    example: '5519999999999',
    description: 'The company phone',
  })
  @IsMobilePhone('pt-BR', undefined, {
    message:
      'O campo "phone" deve ter o seguinte formato "5519999999999"',
  })
  @IsNotEmpty({
    message: getRequiredMessage('phone'),
  })
  phone: string;

  @ApiProperty({
    example: 'AUTOMOTIVE',
    description: 'The company business category',
  })
  @IsString({
    message: getStringMessage(
      'business category',
    ),
  })
  @IsNotEmpty({
    message: getRequiredMessage(
      'business category',
    ),
  })
  businessCategory: BusinessCategory;
}

export class AuthSignInDto {
  @ApiProperty({
    example: 'email@email.com',
    description: 'The user email',
  })
  @IsEmail(undefined, {
    message: 'Email inválido',
  })
  @IsNotEmpty({
    message: getRequiredMessage('email'),
  })
  email: string;

  @ApiProperty({
    description: 'The user password',
  })
  @IsString({
    message: getStringMessage('password'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('password'),
  })
  password: string;
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

export class AccessTokenResponse {
  @ApiProperty({
    description: 'The access token',
  })
  accessToken: string;
}

export interface Token extends JwtPayload {
  email: string;
  exp: number;
  iat: number;
  sub: string;
  userType: USER_TYPE;
}
