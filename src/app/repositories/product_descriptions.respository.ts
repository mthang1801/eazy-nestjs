import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductDescriptionsEntity } from '../entities/product_descriptions.entity';
export class ProductDescriptionsRepository<
  ProductDescriptionsEntity,
> extends BaseRepositorty<ProductDescriptionsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_DESCRIPTION;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductDescriptionsEntity(),
    );
  }
}
