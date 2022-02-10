import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderStatusDataEntity } from '../entities/orderStatus-data.entity';

export class OrderStatusDataRepository<
  OrderStatusDataEntity,
> extends BaseRepositorty<OrderStatusDataEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER_STATUS_DATA;
    this.tableProps = Object.getOwnPropertyNames(new OrderStatusDataEntity());
  }
}
