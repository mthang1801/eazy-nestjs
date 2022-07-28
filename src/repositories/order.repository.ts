import { OrderEntity } from '../entities/order.entity';
import { BaseRepositorty } from '../base/base.repository';
import { Table } from '../database/enums/tables.enum';
import { DatabaseService } from '../database/database.service';
export class OrderRepository extends BaseRepositorty {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
    this.table = Table.ORDER;
    this.tableProps = Object.getOwnPropertyNames(new OrderEntity());
    this.defaultValues = new OrderEntity();
  }
}
