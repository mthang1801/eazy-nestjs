import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductOptionDescriptionEntity } from '../entities/productOptionDescriptions.entity';

export class ProductOptionDescriptionRepository<
  ProductOptionDescriptionEntity,
> extends BaseRepositorty<ProductOptionDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_OPTIONS_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductOptionDescriptionEntity(),
    );
  }
}
