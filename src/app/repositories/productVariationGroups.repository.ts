import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductVariationGroupsEntity } from '../entities/productVariationGroups.entity';

export class ProductVariationGroupsRepository<
  ProductVariationGroupsEntity,
> extends BaseRepositorty<ProductVariationGroupsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_VARIATION_GROUPS;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductVariationGroupsEntity(),
    );
  }
}
