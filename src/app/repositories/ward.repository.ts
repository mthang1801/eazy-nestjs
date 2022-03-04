import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { WardEntity } from '../entities/wards.entity';
export class WardRepository<WardEntity> extends BaseRepositorty<WardEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.WARDS;
    this.tableProps = Object.getOwnPropertyNames(new WardEntity());
  }
}
