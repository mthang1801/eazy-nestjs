import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CartEntity } from '../entities/cart.entity';

@Injectable()
export class CartRepository<CartEntity> extends BaseRepositorty<CartEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CART;
    this.tableProps = Object.getOwnPropertyNames(new CartEntity());
  }
}
