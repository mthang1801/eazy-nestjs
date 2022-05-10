import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { LogSourceEntity } from '../entities/logSource.entity';
export class LogSourceRepository<
  LogSourceEntity,
> extends BaseRepositorty<LogSourceEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.LOG_SOURCE;
    this.tableProps = Object.getOwnPropertyNames(new LogSourceEntity());
  }
}
