import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderHistoryEntity } from '../entities/orderHistory.entity';
export class OrderHistoryRepository<
  OrderHistoryEntity,
> extends BaseRepositorty<OrderHistoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER_HISTORIES;
    this.tableProps = Object.getOwnPropertyNames(new OrderHistoryEntity());
  }
}
