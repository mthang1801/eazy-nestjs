import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { TradeinOldReceiptEntity } from '../entities/tradeinOldReceipt.entity';

@Injectable()
export class TradeinOldReceiptRepository<
  TradeinOldReceiptEntity,
> extends BaseRepositorty<TradeinOldReceiptEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.TRADEIN_OLD_RECEIPT;
    this.tableProps = Object.getOwnPropertyNames(new TradeinOldReceiptEntity());
  }
}
