import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuthUserDto,
  AuthSignInDto,
  USER_TYPE,
  AuthCompanyDto,
  SignInResponse,
  RefreshDto,
} from './dto';
import {
  DEFAULT_RATING,
  PASSWORD_SIZE,
} from 'src/consts';
import { isCNPJValid } from './helpers';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signupUser(dto: AuthUserDto) {
    const { email, name, password, birthday } =
      dto;

    if (password.length < PASSWORD_SIZE)
      throw new BadRequestException(
        `Password must have at least ${PASSWORD_SIZE} characters`,
      );

    const hash = await argon.hash(password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hash,
          birthday: new Date(birthday),
        },
      });

      return {
        accessToken: await this.signToken(
          user.id,
          user.email,
          'USER',
        ),
      };
    } catch (error) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async signupCompany(dto: AuthCompanyDto) {
    const { cnpj, email, name, password, phone } =
      dto;

    if (password.length < PASSWORD_SIZE)
      throw new BadRequestException(
        `Password must have at least ${PASSWORD_SIZE}`,
      );

    if (!isCNPJValid(cnpj))
      throw new BadRequestException(
        'Invalid CNPJ',
      );

    const hash = await argon.hash(password);

    try {
      const company =
        await this.prisma.company.create({
          data: {
            email,
            name,
            password: hash,
            phone,
            cnpj,
            rating: DEFAULT_RATING,
          },
        });

      return {
        accessToken: await this.signToken(
          company.id,
          company.email,
          'COMPANY',
        ),
      };
    } catch (error) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async signin(
    dto: AuthSignInDto,
  ): Promise<SignInResponse> {
    const { userType } = dto;

    let user;

    if (userType === 'USER') {
      user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    } else {
      user = await this.prisma.company.findUnique(
        {
          where: {
            email: dto.email,
          },
        },
      );
    }

    if (!user)
      throw new ForbiddenException(
        'Invalid credentials',
      );

    const passwordMatches = await argon.verify(
      user.password,
      dto.password,
    );
    if (!passwordMatches)
      throw new ForbiddenException(
        'Invalid credentials',
      );

    const accessToken = await this.signToken(
      user.id,
      user.email,
      dto.userType,
    );

    const refreshToken = await this.signToken(
      user.id,
      user.email,
      dto.userType,
      true,
    );

    return { accessToken, refreshToken };
  }

  async signToken(
    userId: number,
    email: string,
    userType: USER_TYPE,
    refresh = false,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email,
      userType,
    };

    const secret = refresh
      ? this.config.get('JWT_REFRESH_SECRET')
      : this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: refresh ? '45d' : '3h',
        secret,
      },
    );
    return token;
  }

  async refreshToken(
    dto: RefreshDto,
    refreshToken: string,
  ) {
    const valid = await this.jwt.verifyAsync(
      refreshToken,
      {
        secret: this.config.get(
          'JWT_REFRESH_SECRET',
        ),
      },
    );

    const { userType } = dto;
    if (!valid || valid.userType !== userType)
      throw new BadRequestException(
        'Invalid refresh token',
      );

    let user;
    if (userType === 'USER') {
      user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    } else {
      user = await this.prisma.company.findUnique(
        {
          where: {
            email: dto.email,
          },
        },
      );
    }

    if (!user)
      throw new ForbiddenException(
        'Invalid credentials',
      );

    if (!user)
      throw new NotFoundException(
        `User with email "${dto.email}" not found`,
      );

    return {
      accessToken: await this.signToken(
        user.id,
        user.email,
        userType,
      ),
    };
  }
}
