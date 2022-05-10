import { CatalogCategoryEntity } from './../entities/catalogCategory.entity';
import { Table } from 'src/database/enums';
import { DatabaseService } from 'src/database/database.service';
import { CatalogCategoryItemEntity } from './../entities/catalogCategoryItem.entity';
import { BaseRepositorty } from './../../base/base.repository';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CatalogCategoryItemRepository<
  CatalogCategoryItemEntity,
> extends BaseRepositorty<CatalogCategoryItemEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATALOG_CATEGORY_ITEMS;
    this.tableProps = Object.getOwnPropertyNames(new CatalogCategoryItemEntity());
  }
}