import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderDocEntity } from '../entities/orderDocs.entity';
export class OrderDocsRepository<
  OrderDocEntity,
> extends BaseRepositorty<OrderDocEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER_DOCS;
    this.tableProps = Object.getOwnPropertyNames(new OrderDocEntity());
  }
}
