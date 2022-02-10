import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderDetailsEntity } from '../entities/orderDetails.entity';
export class OrderDetailsRepository<
  OrderDetailsEntity,
> extends BaseRepositorty<OrderDetailsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER_DETAILS;
    this.tableProps = Object.getOwnPropertyNames(new OrderDetailsEntity());
  }
}
