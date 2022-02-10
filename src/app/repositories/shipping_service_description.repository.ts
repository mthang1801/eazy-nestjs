import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ShippingsServiceDescriptionEntity } from '../entities/shipping_service_description.entity';
export class ShippingServiceDescriptionRepository<ShippingsServiceDescriptionEntity
> extends BaseRepositorty<ShippingsServiceDescriptionEntity
> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.SHIPPING_SERVICE_DESCRIPTION;
    this.tableProps = Object.getOwnPropertyNames(new ShippingsServiceDescriptionEntity());

  }
}