import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';

import {
  $all,
  $any,
  $bw,
  $gt,
  $in,
  $isNull,
  $like,
  $lt,
} from '../database/operators/operators';
import { DatabaseService } from '../database/database.service';
import { formatStandardTimeStamp } from '../utils/helper';
import { Cron, SchedulerRegistry, Timeout } from '@nestjs/schedule';
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
      // const user = await this.userRepo.create(userData);
      // const orderData = {
      //   ...new OrderEntity(),
      //   ...this.orderRepo.setData(data),
      //   user_id: user.user_id,
      // };
      // await this.userRepo.update({ user_id: 1 }, { status: 2 });
      // await this.orderRepo.update({ order_id: 1 }, { status: 2 });
      // await this.userRepo.delete({ user_id: 1 });
      // await this.orderRepo.delete({ order_id: 1 });
      // throw new HttpException('Something went wrong', 400);
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
      //   join: `ddv_user_profiles b ON ${Table.EXAMPLE}.user_id = b.user_id`,
      //   where: "user_id = 1 and user_type = 2 and status = 'A' ",
      // });
      // await this.exampleRepo.findOne({
      //   select: '*',
      //   where: [
      //     {
      //       $or: [
      //         { [`${Table.EXAMPLE}.status`]: $gt(0) },
      //         { [`${Table.EXAMPLE}.user_id`]: $in([1, 2, 3, 4, 5]) },
      //         { [`${Table.EXAMPLE}.age`]: $bw(18, 60) },
      //         {
      //           $and: [
      //             { [`${Table.EXAMPLE}.gender`]: 1 },
      //             { [`${Table.EXAMPLE}.mobile_phone`]: $like('0932139321') },
      //             {
      //               $or: [
      //                 { [`${Table.EXAMPLE}.gender`]: 0 },
      //                 { [`${Table.EXAMPLE}.mobile_phone`]: $like('1234567') },
      //                 {
      //                   $and: [
      //                     { [`${Table.EXAMPLE}.status`]: $lt(1) },
      //                     {
      //                       [`${Table.EXAMPLE}.user_id`]: $in([1, 2, 3, 4, 5]),
      //                     },
      //                   ],
      //                 },
      //               ],
      //             },
      //             { [`${Table.EXAMPLE}.email`]: 'example@example.com' },
      //           ],
      //         },
      //         { [`${Table.EXAMPLE}.email`]: $like('example_order@gmail.comm') },
      //         { [`${Table.EXAMPLE}.status`]: $isNull() },
      //       ],
      //     },
      //   ],
      // });

      console.time('start');
      // const users = await this.userRepo.findMany();
      // await this.exampleRepo.findOne({
      //   select: '*',

      //   where: [
      //     {
      //       $or: [
      //         { [`${Table.EXAMPLE}.status`]: $gt(0) },
      //         { [`${Table.EXAMPLE}.user_id`]: $in([1, 2, 3, 4, 5]) },

      //         {
      //           $and: [
      //             { [`${Table.EXAMPLE}.gender`]: 1 },
      //             { [`${Table.EXAMPLE}.mobile_phone`]: $like('0932139321') },
      //             {
      //               $or: [
      //                 { [`${Table.EXAMPLE}.gender`]: 0 },
      //                 { [`${Table.EXAMPLE}.mobile_phone`]: $like('1234567') },
      //                 {
      //                   $and: [
      //                     { [`${Table.EXAMPLE}.status`]: $lt(1) },
      //                     {
      //                       [`${Table.EXAMPLE}.user_id`]: $in([1, 2, 3, 4, 5]),
      //                     },
      //                   ],
      //                 },
      //               ],
      //             },
      //             { [`${Table.EXAMPLE}.email`]: 'example@example.com' },
      //           ],
      //         },
      //         { [`${Table.EXAMPLE}.email`]: $like('example_order@gmail.comm') },
      //         { [`${Table.EXAMPLE}.status`]: $isNull() },
      //       ],
      //     },
      //   ],
      // });
      // let crypto = new Cryptography();
      // console.log(crypto.genSecurityKey());
      // let user_id = 329138123;
      // let role_id = 5;
      // let encodeUUID = encodeUserAuthentication(user_id, role_id);
      // console.log(decodeUserAuthentication(encodeUUID));
      this.exampleRepo.delete({
        age: $any([1, 2, 3]),
      });
      this.exampleRepo.update({ age: $any([1, 2, 3]) }, { status: 1 });
      // await this.exampleRepo.findOne({
      //   select: '*',
      //   join: {
      //     [Table.EXAMPLE_PROFILE]: {
      //       fieldJoin: `${Table.EXAMPLE_PROFILE}.user_id`,
      //       rootJoin: `${Table.EXAMPLE}.user_id`,
      //     },
      //   },
      //   where: [
      //     {
      //       $or: [
      //         { [`${Table.EXAMPLE}.status`]: $gt(0) },
      //         { [`${Table.EXAMPLE}.user_id`]: $in([1, 2, 3, 4, 5]) },
      //         { [`${Table.EXAMPLE}.age`]: $bw(18, 60) },
      //         {
      //           $and: [
      //             { [`${Table.EXAMPLE}.gender`]: 1 },
      //             { [`${Table.EXAMPLE}.mobile_phone`]: $like('0932139321') },
      //             {
      //               $or: [
      //                 { [`${Table.EXAMPLE}.gender`]: 0 },
      //                 { [`${Table.EXAMPLE}.mobile_phone`]: $like('1234567') },
      //                 {
      //                   $and: [
      //                     { [`${Table.EXAMPLE}.status`]: $lt(1) },
      //                     {
      //                       [`${Table.EXAMPLE}.user_id`]: $in([1, 2, 3, 4, 5]),
      //                     },
      //                   ],
      //                 },
      //               ],
      //             },
      //             { [`${Table.EXAMPLE}.email`]: 'example@example.com' },
      //           ],
      //         },
      //         { [`${Table.EXAMPLE}.email`]: $like('example_order@gmail.comm') },
      //         { [`${Table.EXAMPLE}.status`]: $isNull() },
      //       ],
      //     },
      //   ],
      // });
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
