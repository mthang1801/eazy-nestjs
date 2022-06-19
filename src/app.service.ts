import { Injectable } from '@nestjs/common';
import { Table } from './database/enums';
import { UserEntity } from './entity/user.entity';
import { UserRepository } from './repository/user.repository';
import { MoreThan } from './database/operators/operators';

@Injectable()
export class AppService {
  constructor(private userRepo: UserRepository<UserEntity>) {}

  async getUser() {
    await this.userRepo.findOne({
      select: '*',
      where: [
        {
          $or: [
            // { [`${Table.PRODUCT_PRICES}.or_1`]: MoreThan(0) },
            {
              $and: [
                { [`${Table.USER}.or_and_1`]: MoreThan(10) },
                { [`${Table.USER}.or_and_2`]: MoreThan(25) },
                // {
                //   $or: [
                //     { [`${Table.PRODUCT_PRICES}.or_and_or_1`]: MoreThan(1000) },
                //     { [`${Table.PRODUCTS}.or_and_or_2`]: MoreThan(50) },
                //   ],
                // },
              ],
            },
            { [`${Table.USER}.or_3`]: MoreThan(0) },
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
}
