import {
  ForbiddenException,
  Injectable,
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
} from './dto';

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

      return this.signToken(
        user.id,
        user.email,
        'USER',
      );
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
          },
        });

      return this.signToken(
        company.id,
        company.email,
        'COMPANY',
      );
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

  async signin(dto: AuthSignInDto) {
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

    return this.signToken(
      user.id,
      user.email,
      dto.userType,
    );
  }

  async signToken(
    userId: number,
    email: string,
    userType: USER_TYPE,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
      userType,
    };

    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret,
      },
    );
    return {
      access_token: token,
    };
  }
}
