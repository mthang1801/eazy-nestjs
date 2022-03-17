import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CartItemEntity } from '../entities/cartItem.entity';

@Injectable()
export class CartItemRepository<
  CartItemEntity,
> extends BaseRepositorty<CartItemEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CART_ITEMS;
    this.tableProps = Object.getOwnPropertyNames(new CartItemEntity());
  }
}
