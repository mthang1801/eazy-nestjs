import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductFeatureValueEntity } from '../entities/productFeaturesValues.entity';

export class ProductFeatureValueRepository<
  ProductFeatureValueEntity,
> extends BaseRepositorty<ProductFeatureValueEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_FEATURE_VALUES;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductFeatureValueEntity(),
    );
  }
}
