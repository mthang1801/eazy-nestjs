import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMailExample(to, subject, info): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.mailerService.sendMail({
          to,
          subject,
          template: 'example',
          context: {
            name: info.firstname + ' ' + info.lastname,
            header: info.header,
            body: info.body,
            footer: info.footer,
          },
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
}
