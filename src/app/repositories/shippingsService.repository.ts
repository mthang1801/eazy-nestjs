import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ShippingsServiceEntity } from '../entities/shippingsService.entity';
export class ShippingServiceRepository<
  ShippingsServiceEntity,
> extends BaseRepositorty<ShippingsServiceEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.SHIPPING_SERVICE;
    this.tableProps = Object.getOwnPropertyNames(new ShippingsServiceEntity());
  }
}
