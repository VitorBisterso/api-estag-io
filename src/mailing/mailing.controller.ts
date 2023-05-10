import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Response,
} from '@nestjs/common';
import { MailingService } from './mailing.service';
import {
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Response as Res } from 'express';
import { MailDto } from './dto';

@Controller('mailing')
export class MailingController {
  constructor(
    readonly mailingService: MailingService,
  ) {}

  @ApiOperation({
    summary: 'Send an email',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email sent successfully',
  })
  @Post('send-mail')
  public async sendMail(
    @Body() emailInfo: MailDto,
    @Response() res: Res,
  ) {
    if (
      process.env.SHOULD_SEND_EMAIL.toUpperCase() ===
      'FALSE'
    )
      return res.sendStatus(HttpStatus.CONTINUE);

    return this.mailingService
      .sendMail(emailInfo)
      .then(() => res.sendStatus(HttpStatus.OK))
      .catch(() =>
        res.sendStatus(
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
  }
}
