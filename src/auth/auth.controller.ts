import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthUserDto,
  AuthSignInDto,
  AuthCompanyDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup/user')
  signupUser(@Body() dto: AuthUserDto) {
    return this.authService.signupUser(dto);
  }

  @Post('signup/company')
  signupCompany(@Body() dto: AuthCompanyDto) {
    return this.authService.signupCompany(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthSignInDto) {
    return this.authService.signin(dto);
  }
}
