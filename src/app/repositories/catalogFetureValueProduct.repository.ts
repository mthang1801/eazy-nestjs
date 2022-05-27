import { Table } from 'src/database/enums';
import { DatabaseService } from 'src/database/database.service';
import { BaseRepositorty } from './../../base/base.repository';
import { Injectable } from '@nestjs/common';
import { CatalogFeatureValueProductEntity } from '../entities/catalogFeatureValueProduct.entity';
@Injectable()
export class CatalogFeatureValueProductRepository<
  CatalogFeatureValueProductEntity,
> extends BaseRepositorty<CatalogFeatureValueProductEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATALOG_FEATURE_VALUE_PRODUCT;
    this.tableProps = Object.getOwnPropertyNames(
      new CatalogFeatureValueProductEntity(),
    );
  }
}
