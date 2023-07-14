import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  getRequiredMessage,
  getStringMessage,
} from 'src/utils/messages';

export class MailDto {
  @ApiProperty({
    description: 'Who is the email to',
    example: 'email@email.com',
  })
  @IsString({
    message: getStringMessage('to'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('to'),
  })
  to: string;

  @ApiProperty({
    description: 'The email subject',
    example: 'Verification code',
  })
  @IsString({
    message: getStringMessage('subject'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('subject'),
  })
  subject: string;

  @ApiProperty({
    description:
      'The template name. Must be in the templates folder',
    example: 'verification',
  })
  @IsString({
    message: getStringMessage('template'),
  })
  @IsNotEmpty({
    message: getRequiredMessage('template'),
  })
  template: string;

  @ApiProperty({
    description:
      'The data to be sent to the template',
    example: {
      code: '123',
    },
    required: false,
  })
  @IsOptional()
  context?: Record<string, string>;
}
