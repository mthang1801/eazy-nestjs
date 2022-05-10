import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { TradeinOldReceiptDetailEntity } from '../entities/tradeinOldReceiptDetail.entity';

@Injectable()
export class TradeinOldReceiptDetailRepository<
  TradeinOldReceiptDetailEntity,
> extends BaseRepositorty<TradeinOldReceiptDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.TRADEIN_OLD_RECEIPT_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(
      new TradeinOldReceiptDetailEntity(),
    );
  }
}
