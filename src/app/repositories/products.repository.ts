import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductsEntity } from '../entities/products.entity';
export class ProductsRepository<
  ProductsEntity,
> extends BaseRepositorty<ProductsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCTS;
    this.tableProps = Object.getOwnPropertyNames(new ProductsEntity());
  }
}
