import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderPaymentEntity } from '../entities/orderPayment.entity';
export class OrderPaymentRepository<
  OrderPaymentEntity,
> extends BaseRepositorty<OrderPaymentEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER_PAYMENTS;
    this.tableProps = Object.getOwnPropertyNames(new OrderPaymentEntity());
  }
}
