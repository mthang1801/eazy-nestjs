import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RoleRepository<RoleEntity> extends BaseRepositorty<RoleEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.ROLE;
    this.tableProps = Object.getOwnPropertyNames(new RoleEntity());
  }
}
