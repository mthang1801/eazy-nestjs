import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductOptionVariantDescriptionEntity } from '../entities/productOptionsVariantsDescriptions.entity';

export class ProductOptionVariantDescriptionRepository<
  ProductOptionVariantDescriptionEntity,
> extends BaseRepositorty<ProductOptionVariantDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_OPTIONS_VARIANT_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductOptionVariantDescriptionEntity(),
    );
  }
}
