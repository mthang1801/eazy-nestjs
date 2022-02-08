import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
export class ShippingServiceDescriptionRepository<ShippingsServiceDescription
> extends BaseRepositorty<ShippingsServiceDescription
> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.SHIPPING_SERVICE_DESCRIPTION;
  }
}