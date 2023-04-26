import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { USER_TYPE } from '../dto';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get(
        'JWT_REFRESH_SECRET',
      ),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: {
      sub: number;
      email: string;
      userType: USER_TYPE;
    },
  ) {
    const refreshToken = req
      .get('Authorization')
      .replace('Bearer', '')
      .trim();

    const { userType, email } = payload;

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

    delete user.password;
    return { ...user, refreshToken };
  }
}
