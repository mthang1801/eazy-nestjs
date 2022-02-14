import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';

import { ProductFeatureVariantDescriptionEntity } from '../entities/productFeatureVariantDescription.entity';

export class ProductFeatureVariantDescriptionRepository<
  ProductFeatureVariantDescriptionEntity,
> extends BaseRepositorty<ProductFeatureVariantDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductFeatureVariantDescriptionEntity(),
    );
  }
}
