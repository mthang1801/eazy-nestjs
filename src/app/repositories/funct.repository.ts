import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { FunctEntity } from '../entities/funct.entity';
export class FunctRepository<FunctEntity> extends BaseRepositorty<FunctEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.FUNC;
    this.tableProps = Object.getOwnPropertyNames(new FunctEntity());
  }
}
