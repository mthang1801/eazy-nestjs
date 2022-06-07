import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductPreviewEntity } from '../entities/productPreview.entity';

export class ProductPreviewsRepository<
  ProductPreviewEntity,
> extends BaseRepositorty<ProductPreviewEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_PREVIEW;
    this.tableProps = Object.getOwnPropertyNames(new ProductPreviewEntity());
  }
}
