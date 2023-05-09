import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class MailDto {
  @ApiProperty({
    description: 'Who is the email to',
    example: 'email@email.com',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'The email subject',
    example: 'Verification code',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description:
      'The template name. Must be in the templates folder',
    example: 'verification',
  })
  @IsString()
  @IsNotEmpty()
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
