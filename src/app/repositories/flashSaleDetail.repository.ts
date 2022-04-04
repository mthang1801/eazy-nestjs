import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { FlashSaleDetailEntity } from '../entities/flashSaleDetail.entity';

export class FlashSaleDetailRepository<
  FlashSaleDetailEntity,
> extends BaseRepositorty<FlashSaleDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.FLASH_SALE_DETAILS;
    this.tableProps = Object.getOwnPropertyNames(new FlashSaleDetailEntity());
  }
}
