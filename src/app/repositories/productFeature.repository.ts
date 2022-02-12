import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductFeatureEntity } from '../entities/productFeature.entity';

export class ProductFeaturesRepository<
  ProductFeatureEntity,
> extends BaseRepositorty<ProductFeatureEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_FEATURES;
    this.tableProps = Object.getOwnPropertyNames(new ProductFeatureEntity());
  }
}
