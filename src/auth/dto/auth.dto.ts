import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsDateString,
  IsMobilePhone,
} from 'class-validator';

export type USER_TYPE = 'USER' | 'COMPANY';

export class AuthUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  birthday: string;
}

export class AuthCompanyDto {
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMobilePhone('pt-BR')
  @IsNotEmpty()
  phone: string;
}

export class AuthSignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  userType: USER_TYPE;
}
