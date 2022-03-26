import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductVariationGroupIndexEntity } from '../entities/productVariationGroupIndex.entity';

export class ProductVariationGroupIndexRepository<
  ProductVariationGroupIndexEntity,
> extends BaseRepositorty<ProductVariationGroupIndexEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_VARIATION_GROUP_INDEX;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductVariationGroupIndexEntity(),
    );
  }
}
