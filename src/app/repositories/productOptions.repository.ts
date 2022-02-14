import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductOptionsEntity } from '../entities/productOptions.entity';

export class ProductOptionsRepository<
  ProductOptionsEntity,
> extends BaseRepositorty<ProductOptionsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_OPTIONS;
    this.tableProps = Object.getOwnPropertyNames(new ProductOptionsEntity());
  }
}
