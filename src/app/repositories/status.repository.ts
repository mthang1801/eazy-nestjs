import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { StatusEntity } from '../entities/status.entity';
export class StatusRepository<
  StatusEntity,
> extends BaseRepositorty<StatusEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.STATUS;
    this.tableProps = Object.getOwnPropertyNames(new StatusEntity());
  }
}
