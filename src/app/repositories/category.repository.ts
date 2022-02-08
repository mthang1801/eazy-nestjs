import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryRepository<
  CategoryEntity,
> extends BaseRepositorty<CategoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATEGORIES;
  }

  categoryDataProps = Object.getOwnPropertyNames(new CategoryEntity());
}
