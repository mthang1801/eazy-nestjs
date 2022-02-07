import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';
import { UserEntity, UserDataEntity } from '../entities/user.entity';
import { Table } from '../../database/enums/index';

@Injectable()
export class UserMailingListRepository<
  UserMailingListsEntity,
> extends BaseRepositorty<UserMailingListsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_MAILING_LISTS;
  }
}
