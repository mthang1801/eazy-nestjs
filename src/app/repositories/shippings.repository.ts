import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ShippingsEntity } from '../entities/shippings.entity';
export class ShippingRepository<ShippingsEntity> extends BaseRepositorty<ShippingsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.SHIPPINGS;
    this.tableProps = Object.getOwnPropertyNames(new ShippingsEntity());
  }
}