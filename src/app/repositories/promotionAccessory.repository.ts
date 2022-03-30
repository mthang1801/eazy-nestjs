import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';

export class PromotionAccessoryRepository<
  PromotionAccessoryEntity,
> extends BaseRepositorty<PromotionAccessoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.PROMOTION_ACCESSORY;
    this.tableProps = Object.getOwnPropertyNames(
      new PromotionAccessoryEntity(),
    );
  }
}
