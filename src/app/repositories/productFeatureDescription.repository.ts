import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductFeatureDescriptionEntity } from '../entities/productFeatureDescription.entity';

export class ProductFeatureDescriptionsRepository<
  ProductFeatureDescriptionEntity,
> extends BaseRepositorty<ProductFeatureDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_FEATURE_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductFeatureDescriptionEntity(),
    );
  }
}
