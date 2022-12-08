import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './config/config';
import { DatabaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AvatarsModule } from './avatars/avatars.module';
import { AboutModule } from './about/about.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';


@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    load: [config],
    envFilePath: `.env.${process.env.NODE_ENV}`
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useClass: DatabaseConfig
  }),
  MailerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      transport: {
        host: configService.get("mailHost"),
        auth: {
          user: configService.get("mailUser"),
          pass: configService.get("mailPassword")
        }
      },
    }),
    inject: [ConfigService]
  }),
  UsersModule,
  AuthModule,
  AvatarsModule,
  AboutModule,
  MailModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
