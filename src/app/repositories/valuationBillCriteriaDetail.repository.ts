import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { ValuationBillCriteriaDetailEntity } from '../entities/valuationBillCriteriaDetail.entity';
@Injectable()
export class ValuationBillCriteriaDetailRepository<
  ValuationBillCriteriaDetailEntity,
> extends BaseRepositorty<ValuationBillCriteriaDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.VALUATION_BILL_CRITERIA_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(
      new ValuationBillCriteriaDetailEntity(),
    );
  }
}
