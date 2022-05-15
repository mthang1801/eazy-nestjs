import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { PageDetailEntity } from '../entities/pageDetail.entity';
export class PageDetailRepository<
  PageDetailEntity,
> extends BaseRepositorty<PageDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PAGE_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(new PageDetailEntity());
  }
}
