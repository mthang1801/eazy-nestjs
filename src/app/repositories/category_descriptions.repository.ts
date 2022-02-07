import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';

@Injectable()
export class CategoryDescriptionRepository<
  CategoryDescriptionEntity,
> extends BaseRepositorty<CategoryDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATEGORY_DESCRIPTIONS;
  }
}
