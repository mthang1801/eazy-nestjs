import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../entities/user.entity';
import { join } from 'path';
import { PrimaryKeys } from '../../database/enums/index';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendUserConfirmation(
    originUrl: string,
    user: UserEntity,
    token: string,
  ): Promise<boolean> {
    const prefixApi = this.configService.get<string>('apiBEPrefix');
    const url = join(
      originUrl,
      prefixApi,
      'auth',
      `restore-password?token=${token}&${PrimaryKeys.ddv_users}=${
        user[PrimaryKeys.ddv_users]
      }`,
    );

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Xác nhận khôi phục tài khoản',
      template: 'confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.firstname + ' ' + user.lastname,
        url,
      },
    });
    return true;
  }

  async sendUserActivateSignUpAccount(
    user: UserEntity,
    token: string,
  ): Promise<void> {
    const url = `https://ddvwsdev.ntlogistics.vn/active?user_id=${user.user_id}&token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Di Động Việt [Kích hoạt tài khoản]',
      template: 'activateSignUpAccount',
      context: {
        name: user.firstname + ' ' + user.lastname,
        url,
      },
    });
  }
}
