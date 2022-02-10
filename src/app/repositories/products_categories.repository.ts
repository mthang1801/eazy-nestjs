import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductsEntity } from '../entities/products.entity';
import { ProductsCategoriesEntity } from '../entities/products_categories.entity';
export class ProductsCategoriesRepository<
  ProductsCategoriesEntity,
> extends BaseRepositorty<ProductsCategoriesEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCTS_CATEGORIES;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductsCategoriesEntity(),
    );
  }
}
