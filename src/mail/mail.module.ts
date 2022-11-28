import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [MailerModule],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
