import { Table } from 'src/database/enums';
import { DatabaseService } from 'src/database/database.service';
import { BaseRepositorty } from './../../base/base.repository';
import { Injectable } from '@nestjs/common';
import { CatalogFeatureDetailEntity } from '../entities/catalogFeatureDetail.entity';
@Injectable()
export class CatalogFeatureDetailRepository<
  CatalogFeatureDetailEntity,
> extends BaseRepositorty<CatalogFeatureDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATALOG_FEATURE_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(
      new CatalogFeatureDetailEntity(),
    );
  }
}
