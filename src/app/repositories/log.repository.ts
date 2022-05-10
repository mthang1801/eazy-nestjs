import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { LogEntity } from '../entities/logs.entity';
export class LogRepository<LogEntity> extends BaseRepositorty<LogEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.LOG;
    this.tableProps = Object.getOwnPropertyNames(new LogEntity());
  }
}
