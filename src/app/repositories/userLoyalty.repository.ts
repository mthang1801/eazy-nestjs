import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { UserLoyaltyEntity } from '../entities/userLoyalty.entity';
@Injectable()
export class UserLoyaltyRepository<
  UserLoyaltyEntity,
> extends BaseRepositorty<UserLoyaltyEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USER_LOYALTY;
    this.tableProps = Object.getOwnPropertyNames(new UserLoyaltyEntity());
  }
}
