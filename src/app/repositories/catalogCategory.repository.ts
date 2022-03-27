import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CatalogCategoryEntity } from '../entities/catalogCategory.entity';
@Injectable()
export class CatalogCategoryRepository<
  CatalogCategoryEntity,
> extends BaseRepositorty<CatalogCategoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATALOG_CATEGORIES;
    this.tableProps = Object.getOwnPropertyNames(new CatalogCategoryEntity());
  }
}
