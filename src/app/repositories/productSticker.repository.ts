import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ProductStickerEntity } from '../entities/productSticker.entity';

export class ProductStickerRepository<
  ProductStickerEntity,
> extends BaseRepositorty<ProductStickerEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_STICKER;
    this.tableProps = Object.getOwnPropertyNames(new ProductStickerEntity());
  }
}
