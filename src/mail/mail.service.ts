import { Injectable } from '@nestjs/common';
import { CreateConfirmMailDto } from './dto/createConfirmMail.dto';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('resendApiKey'));
  }

  private resend: Resend;

  async sendEmailConfirmationMail(createConfirmMailDto: CreateConfirmMailDto) {
    const email_url =
      this.configService.get('emailConfirmUrl') + createConfirmMailDto.token;

    return await this.resend.emails.send({
      from: this.configService.get('mailFrom'),
      to: createConfirmMailDto.email,
      subject: 'Email confirmation',

      html: `<p>Hello ${createConfirmMailDto.firstName},</p>
             <p>Please confirm your email by clicking the link below:</p>
             <a href="${email_url}">Confirm Email</a>`,
    });
  }
  async sendResetPasswordMail(createConfirmMailDto: CreateConfirmMailDto) {
    const password_url =
      this.configService.get('passwordConfirmUrl') + createConfirmMailDto.token;

    return await this.resend.emails.send({
      from: this.configService.get('mailFrom'),
      to: createConfirmMailDto.email,
      subject: 'Reset password',
      html: `<p>Hello ${createConfirmMailDto.firstName},</p>
             <p>Please reset your password by clicking the link below:</p>
             <a href="${password_url}">Reset Password</a>`,
    });
  }
}
