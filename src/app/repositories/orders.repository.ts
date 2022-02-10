import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderEntity } from '../entities/orders.entity';
export class OrdersRepository<
  OrderEntity,
> extends BaseRepositorty<OrderEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDERS;
    this.tableProps = Object.getOwnPropertyNames(new OrderEntity());
  }
}
