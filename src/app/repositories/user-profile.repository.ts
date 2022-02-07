import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';
import { UserEntity, UserDataEntity } from '../entities/user.entity';
import { Table } from '../../database/enums/index';
@Injectable()
export class UserProfileRepository<
  UserProfileEntity,
> extends BaseRepositorty<UserProfileEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_PROFILES;
  }
}
