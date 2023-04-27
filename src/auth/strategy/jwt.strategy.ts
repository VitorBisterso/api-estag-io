import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { USER_TYPE } from '../dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    userType: USER_TYPE;
  }) {
    const { sub, userType } = payload;

    let user;
    if (userType === 'USER') {
      user = await this.prisma.user.findUnique({
        where: {
          id: sub,
        },
      });
    } else {
      user = await this.prisma.company.findUnique(
        {
          where: {
            id: sub,
          },
        },
      );
    }

    delete user.password;
    return user;
  }
}
