import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CatalogEntity } from '../entities/catalog.entity';

@Injectable()
export class CatalogRepository<
  CatalogEntity,
> extends BaseRepositorty<CatalogEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATALOG;
    this.tableProps = Object.getOwnPropertyNames(new CatalogEntity());
  }
}
