import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';

import { HomepageConfigModuleEntity } from '../entities/homepageConfigModule.entity';

export class HomepageConfigModuleRepository<
  HomepageConfigModuleEntity,
> extends BaseRepositorty<HomepageConfigModuleEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.HOMEPAGE_MODULE;
    this.tableProps = Object.getOwnPropertyNames(
      new HomepageConfigModuleEntity(),
    );
  }
}
