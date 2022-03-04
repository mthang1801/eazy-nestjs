import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { DistrictEntity } from '../entities/districts.entity';

export class DistrictRepository<
  DistrictEntity,
> extends BaseRepositorty<DistrictEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.DISTRICTS;
    this.tableProps = Object.getOwnPropertyNames(new DistrictEntity());
  }
}
