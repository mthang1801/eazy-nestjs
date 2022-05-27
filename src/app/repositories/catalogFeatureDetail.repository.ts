import { Injectable } from '@nestjs/common';
import { CatalogFeatureDetailEntity } from '../entities/catalogFeatureDetail.entity';
import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
@Injectable()
export class CatalogFeatureDetailRepository<
  CatalogFeatureDetailEntity,
> extends BaseRepositorty<CatalogFeatureDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATALOG_FEATURE_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(new CatalogFeatureDetailEntity());
  }
}