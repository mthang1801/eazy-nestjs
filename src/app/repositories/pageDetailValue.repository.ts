import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { PageDetailValueEntity } from '../entities/pageDetailValue.entity';
export class PageDetailValueRepository<
  PageDetailValueEntity,
> extends BaseRepositorty<PageDetailValueEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PAGE_DETAIL_VALUE;
    this.tableProps = Object.getOwnPropertyNames(new PageDetailValueEntity());
  }
}
