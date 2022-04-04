import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { FlashSaleEntity } from '../entities/flashSale.entity';

export class FlashSaleRepository<
  FlashSaleEntity,
> extends BaseRepositorty<FlashSaleEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.FLASH_SALES;
    this.tableProps = Object.getOwnPropertyNames(new FlashSaleEntity());
  }
}
