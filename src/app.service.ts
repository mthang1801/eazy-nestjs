import { Injectable, HttpException } from '@nestjs/common';
import { Table } from './database/enums';
import { UserEntity } from './entity/user.entity';
import { UserRepository } from './repository/user.repository';
import { OrderRepository } from './repository/order.repository';
import {
  $gt,
  $in,
  $isNull,
  $like,
  $lt,
  MoreThan,
} from './database/operators/operators';
import { OrderEntity } from './entity/order.entity';
import { DatabaseService } from './database/database.service';
import { formatStandardTimeStamp } from './utils/helper';
import { Timeout } from '@nestjs/schedule';
import { SortType } from './database/enums/sortBy.enum';

@Injectable()
export class AppService {
  constructor(
    private userRepo: UserRepository,
    private orderRepo: OrderRepository,
    private db: DatabaseService,
  ) {}

  async getUser() {
    await this.userRepo.findOne({
      select: '*',
      where: [
        {
          $or: [
            { [`${Table.USER}.status`]: $gt(0) },
            { [`${Table.USER}.user_id`]: $in([1, 2, 3, 4, 5]) },
            {
              $and: [
                { [`${Table.USER}.gender`]: 1 },
                { [`${Table.USER}.mobile_phone`]: $like('0932139321') },
                {
                  $or: [
                    { [`${Table.USER}.gender`]: 0 },
                    { [`${Table.USER}.mobile_phone`]: $like('1234567') },
                    {
                      $and: [
                        { [`${Table.USER}.status`]: $lt(1) },
                        { [`${Table.USER}.user_id`]: $in([1, 2, 3, 4, 5]) },
                      ],
                    },
                  ],
                },
                { [`${Table.USER}.email`]: 'example@example.com' },
              ],
            },
            { [`${Table.USER}.email`]: $like('example_order@gmail.comm') },
            { [`${Table.USER}.status`]: $isNull() },
            // { [`${Table.PRODUCT_PRICES}.or_2`]: 'JKJLS782136HK' },
            // { [`${Table.PRODUCTS}.or_3`]: MoreThan(0) },
            // {
            //   [`${Table.PRODUCTS_CATEGORIES}.or_4`]: In([1, 2, 3, 4, 5, 6, 7]),
            // },
            // {
            //   $and: [
            //     { [`${Table.PRODUCT_PRICES}.or_and_1`]: MoreThan(10) },
            //     { [`${Table.PRODUCTS}.or_and_2`]: MoreThan(25) },
            //     {
            //       $or: [
            //         { [`${Table.PRODUCT_PRICES}.or_and_or_1`]: MoreThan(1000) },
            //         { [`${Table.PRODUCTS}.or_and_or_2`]: MoreThan(50) },
            //       ],
            //     },
            //     {
            //       [`${Table.PRODUCTS_CATEGORIES}.or_and_3`]: In([
            //         1, 2, 3, 4, 5, 6, 7,
            //       ]),
            //     },
            //   ],
            // },
          ],
        },
      ],
    });
  }

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
      await this.userRepo.delete({ user_id: 1 });
      await this.orderRepo.delete({ order_id: 1 });
      throw new HttpException('Something went wrong', 400);
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
      await this.userRepo.find({
        join: `ddv_user_profiles b ON ${Table.USER}.user_id = b.user_id`,
        where: "user_id = 1 and user_type = 2 and status = 'A' ",
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
