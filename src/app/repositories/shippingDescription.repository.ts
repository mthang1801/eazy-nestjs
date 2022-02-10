import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ShippingsDescriptionEntity } from '../entities/shippingDescription.entity';
export class ShippingDescriptionRepository<
  ShippingsDescriptionEntity,
> extends BaseRepositorty<ShippingsDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.SHIPPINGS_DESCRIPTION;
    this.tableProps = Object.getOwnPropertyNames(
      new ShippingsDescriptionEntity(),
    );
  }
}
