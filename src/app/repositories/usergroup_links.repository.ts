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
export class UserGroupLinksRepository<
  UserGroupLinkEntity,
> extends BaseRepositorty<UserGroupLinkEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_GROUP_LINKS;
  }
}