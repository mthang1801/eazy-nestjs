import { Injectable } from '@nestjs/common';
import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { UserGroupPrivilegeEntity } from '../entities/usergroupPrivilege.entity';

@Injectable()
export class UserGroupPrivilegesRepository<
  UserGroupPrivilegeEntity,
> extends BaseRepositorty<UserGroupPrivilegeEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_GROUP_PRIVILEGES;
    this.tableProps = Object.getOwnPropertyNames(
      new UserGroupPrivilegeEntity(),
    );
  }
}
