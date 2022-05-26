import { Table } from 'src/database/enums';
import { DatabaseService } from 'src/database/database.service';
import { BaseRepositorty } from './../../base/base.repository';
import { Injectable } from '@nestjs/common';
import { CatalogFeatureEntity } from '../entities/catalogFeature.entity';
@Injectable()
export class CatalogFeatureRepository<
  CatalogFeatureEntity,
> extends BaseRepositorty<CatalogFeatureEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATALOG_FEATURE;
    this.tableProps = Object.getOwnPropertyNames(new CatalogFeatureEntity());
  }
}
