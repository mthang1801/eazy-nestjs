import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { UserDataEntity } from '../entities/userData.entity';

@Injectable()
export class UserDataRepository<
  UserDataEntity,
> extends BaseRepositorty<UserDataEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_DATA;
    this.tableProps = Object.getOwnPropertyNames(new UserDataEntity());
  }
}
