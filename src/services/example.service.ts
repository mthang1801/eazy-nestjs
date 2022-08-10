import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';

import {
  $all,
  $any,
  $bw,
  $eq,
  $gt,
  $in,
  $isNull,
  $like,
  $lt,
  $not,
} from '../database/operators/operators';
import { DatabaseService } from '../database/database.service';

import { Timeout } from '@nestjs/schedule';
// import * as users from 'src/constants/user.mockData.json';
import { Cryptography } from '../utils/cryptography.utils';
import { startToday } from '../utils/functions.utils';
import {
  encodeUserAuthentication,
  decodeUserAuthentication,
} from '../utils/functions.utils';
import { time } from 'console';
import { CronTime } from 'cron';
import { MailService } from './mail.service';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { ExampleRepository } from '../repositories/example.repository';
import { In } from '../database/operators/operators';
import { JoinTable } from '../database/enums/joinTable.enum';

@Injectable()
export class ExampleService {
  constructor(
    private db: DatabaseService,
    private mailService: MailService,
    private i18n: I18nService,
    private exampleRepo: ExampleRepository,
  ) {}

  async getUser() {}

  async create(data) {
    await this.db.startTracking();
    try {
      // const userData = { ...new UserEntity(), ...this.userRepo.setData(data) };
      // await this.db.commitTracking();
    } catch (error) {
      console.log(error);
      await this.db.rollback();
    }
  }

  @Timeout(500)
  async testCondition(data) {
    try {
      console.time('start');

      console.timeEnd('start');
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async createExample() {
    try {
      throw new HttpException('Not Acceptable', HttpStatus.NOT_ACCEPTABLE);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async sendMail(lang: string) {
    let to: string = 'maivthang.95@gmail.com';
    let subject: string = 'test send mail';
    let mailData: any = {
      header: this.i18n.translate('example.MAIL.header', {
        args: { firstname: 'Mai', lastname: 'Thang' },
        lang,
      }),
      body: this.i18n.translate('example.MAIL.body', { lang }),
      footer: this.i18n.translate('example.MAIL.footer', { lang }),
    };

    await this.mailService.sendMailExample(to, subject, mailData);
  }
}
