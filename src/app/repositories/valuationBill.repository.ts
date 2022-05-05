import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { ValuationBillEntity } from '../entities/valuationBill.entity';
@Injectable()
export class ValuationBillRepository<
  ValuationBillEntity,
> extends BaseRepositorty<ValuationBillEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.VALUATION_BILL;
    this.tableProps = Object.getOwnPropertyNames(new ValuationBillEntity());
  }
}
