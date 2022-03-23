import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { UserLoyaltyHistoryEntity } from '../entities/userLoyaltyHistory.entity';
@Injectable()
export class UserLoyaltyHistoryRepository<
  UserLoyaltyHistoryEntity,
> extends BaseRepositorty<UserLoyaltyHistoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_LOYALTY_HISTORY;
    this.tableProps = Object.getOwnPropertyNames(
      new UserLoyaltyHistoryEntity(),
    );
  }
}
