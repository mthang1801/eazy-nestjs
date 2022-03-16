import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductStoreHistoryEntity } from '../entities/productStoreHistory.entity';

export class ProductStoreHistoryRepository<
  ProductStoreHistoryEntity,
> extends BaseRepositorty<ProductStoreHistoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_STORE_HISTORIES;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductStoreHistoryEntity(),
    );
  }
}
