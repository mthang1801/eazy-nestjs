import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductVariationGroupProductsEntity } from '../entities/productVariationGroupProducts.entity';

export class ProductVariationGroupProductsRepository<
  ProductVariationGroupProductsEntity,
> extends BaseRepositorty<ProductVariationGroupProductsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_VARIATION_GROUP_PRODUCTS;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductVariationGroupProductsEntity(),
    );
  }
}
