import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';

import { ShippingFeeLocationEntity } from '../entities/shippingFeeLocation.entity';

export class ShippingFeeLocationRepository<
  ShippingFeeLocationEntity,
> extends BaseRepositorty<ShippingFeeLocationEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.SHIPPING_FEE_LOCATION;
    this.tableProps = Object.getOwnPropertyNames(
      new ShippingFeeLocationEntity(),
    );
  }
}
