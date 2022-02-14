import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { UserEntity } from '../entities/user.entity';
@Injectable()
export class UserRepository<UserEntity> extends BaseRepositorty<UserEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USERS;
    this.tableProps = Object.getOwnPropertyNames(new UserEntity());

  }
}
