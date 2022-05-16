import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';
import { PromotionAccessoryDetailEntity } from '../entities/promotionAccessoryDetail.entity';

export class PromotionAccessoryDetailRepository<
  PromotionAccessoryDetailEntity,
> extends BaseRepositorty<PromotionAccessoryDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PRODUCT_PROMOTION_ACCESSOR_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(
      new PromotionAccessoryDetailEntity(),
    );
  }
}
