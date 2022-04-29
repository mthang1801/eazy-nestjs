import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { TradeinProgramDetailEntity } from '../entities/tradeinProgramDetail.entity';

@Injectable()
export class TradeinProgramDetailRepository<
  TradeinProgramDetailEntity,
> extends BaseRepositorty<TradeinProgramDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.TRADEIN_PROGRAM_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(
      new TradeinProgramDetailEntity(),
    );
  }
}
