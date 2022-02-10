import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderStatusDescriptionEntity } from '../entities/orderStatusDescription.entity';

export class OrderStatusDescriptionRepository<
  orderStatusDescriptionEntity,
> extends BaseRepositorty<orderStatusDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ORDER_STATUS_DESCRIPTION;
    this.tableProps = Object.getOwnPropertyNames(
      new OrderStatusDescriptionEntity(),
    );
  }
}
