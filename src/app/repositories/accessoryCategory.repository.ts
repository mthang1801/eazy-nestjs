import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';

import { AccessoryCategoryEntity } from '../entities/accessoryCategory.entity';
export class AccessoryCategoryRepository<
  AccessoryCategoryEntity,
> extends BaseRepositorty<AccessoryCategoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ACCESSORY_CATEGORY;
    this.tableProps = Object.getOwnPropertyNames(new AccessoryCategoryEntity());
  }
}
