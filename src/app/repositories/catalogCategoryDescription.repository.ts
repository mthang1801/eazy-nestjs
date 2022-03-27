import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CatalogCategoryDescriptionEntity } from '../entities/catalogCategoryDescription.entity';

@Injectable()
export class CatalogCategoryDescriptionRepository<
  CatalogCategoryDescriptionEntity,
> extends BaseRepositorty<CatalogCategoryDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATALOG_CATEGORY_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new CatalogCategoryDescriptionEntity(),
    );
  }
}
