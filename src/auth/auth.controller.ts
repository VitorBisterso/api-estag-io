import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthUserDto,
  AuthSignInDto,
  AuthCompanyDto,
  SignInResponse,
  RefreshDto,
} from './dto';
import { RefreshTokenGuard } from './guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Create a student' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'An access token',
    type: String,
  })
  @Post('signup/user')
  signupUser(@Body() dto: AuthUserDto) {
    return this.authService.signupUser(dto);
  }

  @ApiOperation({ summary: 'Create a company' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'An access token',
    type: String,
  })
  @Post('signup/company')
  signupCompany(@Body() dto: AuthCompanyDto) {
    return this.authService.signupCompany(dto);
  }

  @ApiOperation({ summary: 'Sign in an user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access and refresh tokens',
    type: SignInResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthSignInDto) {
    return this.authService.signin(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshTokens(
    @Req() req: Request,
    @Body()
    dto: RefreshDto,
  ) {
    const { refreshToken } = (
      req as Record<any, any>
    ).user;
    return this.authService.refreshToken(
      dto,
      refreshToken,
    );
  }
}
