import { Injectable } from '@nestjs/common';
import {
  UserGroupEntity,
  UserGroupPrivilegeEntity,
} from '../entities/usergroups.entity';
import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import {
  UserGroupLinkEntity,
  UserGroupDescriptionEntity,
} from '../entities/usergroups.entity';

@Injectable()
export class UserGroupPrivilegesRepository<
  UserGroupPrivilegeEntity,
> extends BaseRepositorty<UserGroupPrivilegeEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_GROUP_PRIVILEGES;
  }

  userGroupPrivilegeProps = Object.getOwnPropertyNames(
    new UserGroupPrivilegeEntity(),
  );
}
