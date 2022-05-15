import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { PageEntity } from '../entities/page.entity';
export class PageRepository<PageEntity> extends BaseRepositorty<PageEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PAGE;
    this.tableProps = Object.getOwnPropertyNames(new PageEntity());
  }
}
