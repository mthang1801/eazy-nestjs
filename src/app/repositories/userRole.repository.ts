import { Injectable } from '@nestjs/common';
import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { UserRoleEntity } from '../entities/userRole.entity';

@Injectable()
export class UserRoleRepository<
  UserRoleEntity,
> extends BaseRepositorty<UserRoleEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_ROLES;
    this.tableProps = Object.getOwnPropertyNames(new UserRoleEntity());
  }
}
