import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { StatusDataEntity } from '../entities/statusData.entity';

export class StatusDataRepository<
  StatusDataEntity,
> extends BaseRepositorty<StatusDataEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.STATUS_DATA;
    this.tableProps = Object.getOwnPropertyNames(new StatusDataEntity());
  }
}
