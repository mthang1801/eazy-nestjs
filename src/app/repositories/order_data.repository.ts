import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderDataEntity } from '../entities/order_data.entity';
export class OrderDataRepository<
  OrderDataEntity,
> extends BaseRepositorty<OrderDataEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER_DATA;
    this.tableProps = Object.getOwnPropertyNames(new OrderDataEntity());
  }
}
