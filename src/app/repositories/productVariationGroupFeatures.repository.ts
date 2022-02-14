import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductVariationGroupFeaturesEntity } from '../entities/productVariationGroupFeatures.entity';

export class ProductVariationGroupFeaturesRepository<
  ProductVariationGroupFeaturesEntity,
> extends BaseRepositorty<ProductVariationGroupFeaturesEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_VARIATION_GROUP_FEATURES;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductVariationGroupFeaturesEntity(),
    );
  }
}
