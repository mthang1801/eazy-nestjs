import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { TradeinProgramCriteriaDetailEntity } from '../entities/tradeinProgramCriteriaDetail.entity';

@Injectable()
export class TradeinProgramCriteriaDetailRepository<
  TradeinProgramCriteriaDetailEntity,
> extends BaseRepositorty<TradeinProgramCriteriaDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.TRADEIN_PROGRAM_CRITERIA_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(
      new TradeinProgramCriteriaDetailEntity(),
    );
  }
}
