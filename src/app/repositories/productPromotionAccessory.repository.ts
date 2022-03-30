import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';
import { ProductPromotionAccessoryEntity } from '../entities/productPromotionAccessory.entity';

export class ProductPromotionAccessoryRepository<
  ProductPromotionAccessoryEntity,
> extends BaseRepositorty<ProductPromotionAccessoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_PROMOTION_ACCESSORY;
    this.tableProps = Object.getOwnPropertyNames(
      new ProductPromotionAccessoryEntity(),
    );
  }
}
