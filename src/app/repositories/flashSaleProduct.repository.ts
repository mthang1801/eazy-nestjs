import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { FlashSaleProductEntity } from '../entities/flashSaleProduct.entity';

export class FlashSaleProductRepository<
  FlashSaleProductEntity,
> extends BaseRepositorty<FlashSaleProductEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.FLASH_SALE_PRODUCTS;
    this.tableProps = Object.getOwnPropertyNames(new FlashSaleProductEntity());
  }
}
