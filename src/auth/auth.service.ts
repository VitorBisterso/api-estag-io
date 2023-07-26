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
import jwtDecode from 'jwt-decode';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuthUserDto,
  AuthSignInDto,
  USER_TYPE,
  AuthCompanyDto,
  SignInResponse,
  Token,
} from './dto';
import {
  DEFAULT_RATING,
  PASSWORD_SIZE,
} from 'src/consts';
import { isCNPJValid } from './helpers';
import { getNotFoundMessage } from 'src/utils/messages';

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
        `O campo "password" deve ter no mínimo ${PASSWORD_SIZE} caracteres`,
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
            'Este email já está cadastrado',
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
        `O campo "password" deve ter no mínimo ${PASSWORD_SIZE} caracteres`,
      );

    if (!isCNPJValid(cnpj))
      throw new BadRequestException(
        'CNPJ inválido',
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
            'Este email já está cadastrado',
          );
        }
      }
      throw error;
    }
  }

  async signin(
    dto: AuthSignInDto,
  ): Promise<SignInResponse> {
    let user, userType: USER_TYPE;

    userType = 'USER';
    user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      userType = 'COMPANY';
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
        'Credenciais inválidas',
      );

    const passwordMatches = await argon.verify(
      user.password,
      dto.password,
    );
    if (!passwordMatches)
      throw new ForbiddenException(
        'Credenciais inválidas',
      );

    const accessToken = await this.signToken(
      user.id,
      user.email,
      userType,
    );

    const refreshToken = await this.signToken(
      user.id,
      user.email,
      userType,
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

  async refreshToken(refreshToken: string) {
    const valid = await this.jwt.verifyAsync(
      refreshToken,
      {
        secret: this.config.get(
          'JWT_REFRESH_SECRET',
        ),
      },
    );

    const decoded =
      jwtDecode<Token>(refreshToken);
    const { email, userType } = decoded;
    if (!valid || valid.userType !== userType)
      throw new BadRequestException(
        'Token inválido',
      );

    let user;
    if (userType === 'USER') {
      user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
    } else {
      user = await this.prisma.company.findUnique(
        {
          where: {
            email,
          },
        },
      );
    }

    if (!user)
      throw new ForbiddenException(
        'Credenciais inválidas',
      );

    if (!user)
      throw new NotFoundException(
        getNotFoundMessage('Usuário', email),
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
