import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { UserGroupEntity } from '../entities/usergroups.entity';

@Injectable()
export class UserGroupsRepository<
  UserGroupEntity,
> extends BaseRepositorty<UserGroupEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_GROUPS;
  }

  userGroupDataProps = Object.getOwnPropertyNames(new UserGroupEntity());
}
