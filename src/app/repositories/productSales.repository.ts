import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductSalesEntity } from '../entities/productSales.entity';

export class ProductSalesRepository<
  ProductSalesEntity,
> extends BaseRepositorty<ProductSalesEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_SALES;
    this.tableProps = Object.getOwnPropertyNames(new ProductSalesEntity());
  }
}
