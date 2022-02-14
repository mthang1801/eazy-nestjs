import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductPricesEntity } from '../entities/productPrices.entity';

export class ProductPricesRepository<
  ProductPricesEntity,
> extends BaseRepositorty<ProductPricesEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_PRICES;
    this.tableProps = Object.getOwnPropertyNames(new ProductPricesEntity());
  }
}
