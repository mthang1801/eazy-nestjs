import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductPointPriceEntity } from '../entities/productPointPrices.entity';

export class ProductPointPriceRepository<
  ProductPointPriceEntity,
> extends BaseRepositorty<ProductPointPriceEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_POINT_PRICES;
    this.tableProps = Object.getOwnPropertyNames(new ProductPointPriceEntity());
  }
}
