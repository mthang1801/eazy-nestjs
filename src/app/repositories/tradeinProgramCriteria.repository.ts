import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { TradeinProgramCriteriaEntity } from '../entities/tradeinProgramCriteria.entity';

@Injectable()
export class TradeinProgramCriteriaRepository<
  TradeinProgramCriteriaEntity,
> extends BaseRepositorty<TradeinProgramCriteriaEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.TRADEIN_PROGRAM_CRITERIA;
    this.tableProps = Object.getOwnPropertyNames(
      new TradeinProgramCriteriaEntity(),
    );
  }
}
