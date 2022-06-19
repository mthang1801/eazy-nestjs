import { OrderEntity } from '../entity/order.entity';
import { BaseRepositorty } from '../base/base.repository';
import { Table } from '../database/enums/tables.enum';
import { DatabaseService } from '../database/database.service';
export class OrderRepository<OrderEntity> extends BaseRepositorty<OrderEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER;
    this.tableProps = Object.getOwnPropertyNames(new OrderEntity());
  }
}
