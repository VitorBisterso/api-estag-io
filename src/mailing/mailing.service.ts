import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';
import { MailDto } from './dto';

@Injectable()
export class MailingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  private async setTransport() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken: string = await new Promise(
      (resolve, reject) => {
        oauth2Client.getAccessToken(
          (err, token) => {
            if (err) {
              reject(
                'Mailing: Failed to create access token',
              );
            }
            resolve(token);
          },
        );
      },
    );

    const config: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get('EMAIL'),
        clientId:
          this.configService.get('CLIENT_ID'),
        clientSecret: this.configService.get(
          'CLIENT_SECRET',
        ),
        accessToken,
      },
    };
    this.mailerService.addTransporter(
      'gmail',
      config,
    );
  }

  public async sendMail(emailInfo: MailDto) {
    await this.setTransport();

    const { to, subject, template, context } =
      emailInfo;

    return this.mailerService.sendMail({
      transporterName: 'gmail',
      to, // list of receivers
      from: 'noreply@nestjs.com', // sender address
      subject,
      template,
      context,
    });
  }
}
