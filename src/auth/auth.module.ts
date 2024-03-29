import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  JwtStrategy,
  RefreshTokenStrategy,
} from './strategy';
import { MailingService } from 'src/mailing/mailing.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    MailingService,
  ],
})
export class AuthModule {}
