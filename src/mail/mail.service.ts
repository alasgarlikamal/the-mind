import { Injectable } from '@nestjs/common';
import { CreateConfirmMailDto } from './dto/createConfirmMail.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmailConfirmationMail(createConfirmMailDto: CreateConfirmMailDto) {
    const email_url =
      this.configService.get('emailConfirmUrl') + createConfirmMailDto.token;
    return await this.mailerService.sendMail({
      to: createConfirmMailDto.email,
      from: this.configService.get('mailFrom'),
      subject: 'Email confirmation',
      template: 'email',
      context: {
        email_name: createConfirmMailDto.firstName,
        email_url,
      },
    });
  }
  async sendResetPasswordMail(createConfirmMailDto: CreateConfirmMailDto) {
    const password_url =
      this.configService.get('passwordConfirmUrl') + createConfirmMailDto.token;
    return await this.mailerService.sendMail({
      to: createConfirmMailDto.email,
      from: this.configService.get('mailFrom'),
      subject: 'Reset password',
      template: 'password',
      context: {
        password_name: createConfirmMailDto.firstName,
        password_url,
      },
    });
  }
}
