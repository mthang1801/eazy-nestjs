import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderTransactionsEntity } from '../entities/order_transactions.entity';
export class OrderTransactionRepository<
  OrderTransactionsEntity,
> extends BaseRepositorty<OrderTransactionsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER_TRANSACTIONS;
    this.tableProps = Object.getOwnPropertyNames(new OrderTransactionsEntity());
  }
}
