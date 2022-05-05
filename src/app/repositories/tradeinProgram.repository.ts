import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { TradeinProgramEntity } from '../entities/tradeinProgram.entity';

@Injectable()
export class TradeinProgramRepository<
  TradeinProgramEntity,
> extends BaseRepositorty<TradeinProgramEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.TRADEIN_PROGRAM;
    this.tableProps = Object.getOwnPropertyNames(new TradeinProgramEntity());
  }
}
