import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductOptionVariantsEntity } from '../entities/productOptionVariants.entity';

export class ProductOptionVariantsRepository<
  ProductOptionVariantsEntity,
> extends BaseRepositorty<ProductOptionVariantsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_OPTIONS_VARIANTS;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductOptionVariantsEntity(),
    );
  }
}
