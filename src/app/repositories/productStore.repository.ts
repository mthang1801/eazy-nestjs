import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductStoreEntity } from '../entities/productStore.entity';

export class ProductStoreRepository<
  ProductStoreEntity,
> extends BaseRepositorty<ProductStoreEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_STORES;
    this.tableProps = Object.getOwnPropertyNames(new ProductStoreEntity());
  }
}
