import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from '../services/mail.service';
import { join } from 'path';
import { ConfigService, ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('mailHost'),
          secure: true,
          port: +configService.get<number>('mailPort'),
          auth: {
            user: configService.get<string>('mailUser'),
            pass: configService.get<string>('mailPass'),
          },
        },
        defaults: {
          from: '"No Reply" <support@ddvecom.com>',
        },
        template: {
          dir: join(__dirname, '..', '..', '..', 'views', 'mail'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
