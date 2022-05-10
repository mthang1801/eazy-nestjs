import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { LogModuleEntity } from '../entities/logModule.entity';
export class LogModuleRepository<
  LogModuleEntity,
> extends BaseRepositorty<LogModuleEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.LOG_MODULE;
    this.tableProps = Object.getOwnPropertyNames(new LogModuleEntity());
  }
}
