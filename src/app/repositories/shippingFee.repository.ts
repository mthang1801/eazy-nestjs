import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ShippingFeeEntity } from '../entities/shippingFee.entity';

export class ShippingFeeRepository<
  ShippingFeeEntity,
> extends BaseRepositorty<ShippingFeeEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.SHIPPING_FEE;
    this.tableProps = Object.getOwnPropertyNames(new ShippingFeeEntity());
  }
}
