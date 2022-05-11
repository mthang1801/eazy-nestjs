import { Injectable } from '@nestjs/common';
import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { RoleFunctionEntity } from '../entities/roleFunction.entity';

@Injectable()
export class RoleFunctionRepository<
  RoleFunctionEntity,
> extends BaseRepositorty<RoleFunctionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ROLE_FUNC;
    this.tableProps = Object.getOwnPropertyNames(new RoleFunctionEntity());
  }
}
