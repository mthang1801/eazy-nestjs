import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductOptionsInventoryEntity } from '../entities/productOptionsInventory.entity';

export class ProductOptionsInventoryRepository<
  ProductOptionsInventoryEntity,
> extends BaseRepositorty<ProductOptionsInventoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_OPTIONS_INVENTORY;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductOptionsInventoryEntity(),
    );
  }
}
