import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductFeatureVariantEntity } from '../entities/productFeatureVariant.entity';

export class ProductFeatureVariantsRepository<
  ProductFeatureVariantEntity,
> extends BaseRepositorty<ProductFeatureVariantEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_FEATURES_VARIANTS;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductFeatureVariantEntity(),
    );
  }
}
