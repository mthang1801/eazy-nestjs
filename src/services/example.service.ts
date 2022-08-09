import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Table } from '../database/enums';

import {
  $gt,
  $in,
  $isNull,
  $like,
  $lt,
  MoreThan,
} from '../database/operators/operators';
import { OrderEntity } from '../entities/order.entity';
import { DatabaseService } from '../database/database.service';
import { formatStandardTimeStamp } from '../utils/helper';
import { Cron, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import * as users from 'src/constants/user.mockData.json';
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

@Injectable()
export class ExampleService {
  constructor(
    private db: DatabaseService,
    private mailService: MailService,
    private i18n: I18nService,
  ) {}

  async getUser() {}

  async create(data) {
    await this.db.startTracking();
    try {
      // const userData = { ...new UserEntity(), ...this.userRepo.setData(data) };
      // const user = await this.userRepo.create(userData);
      // const orderData = {
      //   ...new OrderEntity(),
      //   ...this.orderRepo.setData(data),
      //   user_id: user.user_id,
      // };
      // const order = await this.orderRepo.create(orderData);
      // await this.userRepo.update({ user_id: 1 }, { status: 2 });
      // await this.orderRepo.update({ order_id: 1 }, { status: 2 });
      // await this.userRepo.delete({ user_id: 1 });
      // await this.orderRepo.delete({ order_id: 1 });
      // throw new HttpException('Something went wrong', 400);
      // await this.userRepo.update(
      //   {
      //     user_id: user.user_id,
      //   },
      //   { updated_at: formatStandardTimeStamp() },
      // );
      // await this.orderRepo.update(
      //   {
      //     order_id: order.order_id,
      //   },
      //   { updated_at: formatStandardTimeStamp() },
      // );
      // await this.db.commitTracking();
    } catch (error) {
      console.log(error);
      await this.db.rollback();
    }
  }

  @Timeout(500)
  async testCondition(data) {
    try {
      // await this.userRepo.find({
      //   orderBy: [{ sortBy: 'updated_at', sortType: SortType.DESC }],
      // });
      // await this.userRepo.find({
      //   join: `ddv_user_profiles b ON ${Table.USER}.user_id = b.user_id`,
      //   where: "user_id = 1 and user_type = 2 and status = 'A' ",
      // });
      // await this.userRepo.createMany(users);
      this;
      console.time('start');
      // const users = await this.userRepo.findMany();

      // const user = await this.userRepo.findOne({
      //   where: { '1': 1 },
      //   orderBy: [{ sortBy: `${Table.USER}.created_at`, sortType: 'ASC' }],
      // });

      let crypto = new Cryptography();
      console.log(crypto.genSecurityKey());
      let user_id = 329138123;
      let role_id = 5;
      let encodeUUID = encodeUserAuthentication(user_id, role_id);
      console.log(decodeUserAuthentication(encodeUUID));

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
    let to: string = 'mthang1801@gmail.com';
    let subject: string = 'test send mail';
    let mailData: any = {
      header: this.i18n.translate('example.MAIL.header', {
        args: { firstname: 'Mai', lastname: 'Thang' },
        lang,
      }),
      body: this.i18n.translate('example.MAIL.body', { lang }),
      footer: this.i18n.translate('example.MAIL.footer', { lang }),
    };
    console.log(mailData);
    await this.mailService.sendMailExample(to, subject, mailData);
  }
}
