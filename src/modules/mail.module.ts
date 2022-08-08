import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from '../services/mail.service';
import { join } from 'path';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService, i18nService: I18nService) => ({
        transport: {
          host: configService.get<string>('mailHost'),
          secure: true,
          port: configService.get<number>('mailPort'),
          auth: {
            user: configService.get<string>('mailUser'),
            pass: configService.get<string>('mailPass'),
          },
          tls: { rejectUnauthorized: false },
          debug: true,
        },
        defaults: {
          from: `${configService.get<string>('mailUser')}`,
        },
        template: {
          dir: join(__dirname, '..', '..', 'views', 'mail'),
          adapter: new HandlebarsAdapter({ t: i18nService.hbsHelper }),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService, I18nService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
