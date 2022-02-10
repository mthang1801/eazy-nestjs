import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CategoryDescriptionEntity } from '../entities/categoryDescription.entity';

@Injectable()
export class CategoryDescriptionRepository<
  CategoryDescriptionEntity,
> extends BaseRepositorty<CategoryDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATEGORY_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new CategoryDescriptionEntity(),
    );
  }
}
