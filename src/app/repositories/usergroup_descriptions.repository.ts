import { Injectable } from '@nestjs/common';
import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { UserGroupDescriptionEntity } from '../entities/usergroups.entity';

@Injectable()
export class UserGroupDescriptionsRepository<
  UserGroupDescriptionEntity,
> extends BaseRepositorty<UserGroupDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_GROUP_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new UserGroupDescriptionEntity(),
    );
  }
}
