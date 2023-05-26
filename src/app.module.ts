import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailingModule } from './mailing/mailing.module';
import { ProcessStepsModule } from './process-steps/process-steps.module';
import { InternshipsModule } from './internships/internships.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [
    MailingModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport:
        'smtps://user@domain.com:pass@smtp.domain.com',
      template: {
        dir: process.cwd() + '/templates',
        adapter: new HandlebarsAdapter(
          /* helpers */ undefined,
          {
            inlineCssEnabled: true,
            /** See https://www.npmjs.com/package/inline-css#api */
            inlineCssOptions: {
              url: ' ',
              preserveMediaQueries: true,
            },
          },
        ),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    PrismaModule,
    OpportunitiesModule,
    ProcessStepsModule,
    InternshipsModule,
    ReviewsModule,
    CompaniesModule,
  ],
})
export class AppModule {}
