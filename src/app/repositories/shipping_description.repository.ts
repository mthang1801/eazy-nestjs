import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
export class ShippingDescriptionRepository<ShippingsDescription> extends BaseRepositorty<ShippingsDescription> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.SHIPPINGS_DESCRIPTION;
  }
}